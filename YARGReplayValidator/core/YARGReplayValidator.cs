using Newtonsoft.Json;
using YARG.Core;
using YARG.Core.Chart;
using YARG.Core.Engine;
using YARG.Core.Engine.Drums;
using YARG.Core.Engine.Guitar;
using YARG.Core.Engine.Vocals;
using YARG.Core.Game;
using YARG.Core.Replays;
using YARG.Core.Replays.Analyzer;

namespace YARGReplayValidator.Core
{
  public enum HOPOFreq : short
  {
    HOPOFreq0,
    HOPOFreq1,
    HOPOFreq2,
    HOPOFreq3,
    HOPOFreq4,
    HOPOFreq5,
  }
  public enum ReadMode : short
  {
    /// <summary>
    /// Validates REPLAY files only.
    /// </summary>
    ReplayOnly,

    /// <summary>
    /// Validates REPLAY and MIDI/CHART files, including MIDI data.
    /// </summary>
    ReplayAndMidi,

    /// <summary>
    /// Validates MIDI/CHART files only.
    /// </summary>
    MidiOnly,

    /// <summary>
    /// Returns song hash and nothing else.
    /// </summary>
    ReturnSongHash
  }
  public enum EngineValue : short
  {
    Unknown = -1,
    Default,
    Casual,
    Precision,
  }

  public class YARGReplayValidatorCore
  {
    public static ParseSettings GetParseSettings(bool isChart, bool isRB3CON = false, bool proDrums = true, bool fiveLaneDrums = false, long? sustainCutoffThreshold = null, int? multiplierNote = null, long? hopoThreshold = null, bool eighthNoteHopo = false, int? hopofreq = null, string? chartPath = null)
    {
      var parseSettings = isChart ? ParseSettings.Default_Chart : ParseSettings.Default_Midi;
      parseSettings.DrumsType = DrumsType.FourLane;
      //
      parseSettings.ChordHopoCancellation = !isChart;
      parseSettings.NoteSnapThreshold = isRB3CON ? 10 : 0;
      if (fiveLaneDrums) parseSettings.DrumsType = DrumsType.FiveLane;
      //else if (proDrums) parseSettings.DrumsType = DrumsType.ProDrums;
      //
      if (sustainCutoffThreshold is not null) parseSettings.SustainCutoffThreshold = (long)sustainCutoffThreshold;
      if (multiplierNote is not null) parseSettings.StarPowerNote = (int)multiplierNote;
      if (hopoThreshold is not null) parseSettings.HopoThreshold = (long)hopoThreshold;
      else if ((eighthNoteHopo || hopofreq is not null) && chartPath is not null)
      {
        if (!File.Exists(chartPath))
        {
          throw new FileNotFoundException($"Chart not included!");
        }
        var chart = SongChart.FromFile(parseSettings, chartPath);
        var resolution = chart.Resolution;
        if (eighthNoteHopo)
        {
          parseSettings.HopoThreshold = resolution / 2;
        }
        else
        {
          long denominator = hopofreq switch
          {
            0 => 24,
            1 => 16,
            2 => 12,
            3 => 8,
            4 => 6,
            5 => 4,
            _ => throw new NotImplementedException($"Unhandled hopofreq value {hopofreq}!")
          };
          parseSettings.HopoThreshold = 4 * resolution / denominator;
        }
      }
      return parseSettings;
    }

    public static Dictionary<string, object> ReadReplay(string replayFilePath, ReadMode readMode, string? chartPath = null, ParseSettings? parseSettings = null)
    {
      ReplayInfo replayInfo;
      ReplayData replayData;
      Dictionary<string, object> output = [];
      SongChart? chart = null;
      if (readMode != ReadMode.ReturnSongHash)
      {
        if (chartPath is null || parseSettings is null)
        {
          throw new Exception("Missing MIDI path/parse settings.");
        }
        chart = SongChart.FromFile((ParseSettings)parseSettings, chartPath);
      }

      if (readMode != ReadMode.MidiOnly)
      {
        (var result, replayInfo, replayData) = ReplayIO.TryDeserialize(replayFilePath);


        if (result != ReplayReadResult.Valid)
        {
          throw new Exception($"Failed to load replay. Read Result: {result}.");
        }
        if (replayData.Frames.Length == 0)
        {
          throw new Exception("Replay doesn't contain any players.");
        }
        if (readMode == ReadMode.ReturnSongHash)
        {
          output.Add("SongChecksum", replayInfo.SongChecksum);
          return output;
        }
        // check if replay contains bots (it shouldn't)
        foreach (var frame in replayData.Frames)
        {
          if (frame.Profile.IsBot) throw new Exception("Provided REPLAY file can\'t have BOT players.");
        }
        // validate replay
        var results = ReplayAnalyzer.AnalyzeReplay(chart, replayData);
        var bandScore = results.Sum(x => x.ResultStats.TotalScore);
        if (bandScore != replayInfo.BandScore)
        {
          if (results.Length != replayData.Frames.Length)
          {
            throw new Exception("Analysis results and replay frames differ in size.");
          }
          else
          {
            throw new Exception("REPLAY file band score and simulated band score don't match.");
          }
        }
        output.Add("ReplayInfo", replayInfo);
        List<object> frameStorage = [];
        for (int frameIndex = 0; frameIndex < replayData.Frames.Length; frameIndex++)
        {
          Dictionary<string, object> thisFrameStorage = new()
            {
                { "Profile", replayData.Frames[frameIndex].Profile },
                { "Stats", results[frameIndex].ResultStats }
            };
          var engine = GetEngineValue(replayData.Frames[frameIndex], replayInfo);
          thisFrameStorage.Add("Engine", engine);
          frameStorage.Add(thisFrameStorage);
        }
        output.Add("ReplayData", frameStorage);
      }
      if (readMode == ReadMode.MidiOnly || readMode == ReadMode.ReplayAndMidi)
      {
        Dictionary<byte, Dictionary<byte, long>> noteStorage = [];
        Dictionary<byte, Dictionary<byte, long>> starPowerStorage = [];
        // fetch chart data
        foreach (var track in chart.FiveFretTracks)
        { // TODO: refactor content of this foreach to separate method; apply foreach in other types of tracks as well (e.g. SixFretTracks, DrumsTracks etc.)
          // check track types in https://github.com/YARC-Official/YARG.Core/blob/80e518350cec7928b421d819ef58f89c84c39975/YARG.Core/Chart/SongChart.cs#L30
          Dictionary<byte, long> diffNoteStorage = [];
          Dictionary<byte, long> diffStarPowerStorage = [];
          foreach (Difficulty diff in Enum.GetValues<Difficulty>())
          {
            if (!track.TryGetDifficulty(diff, out var instrumentDifficulty) || instrumentDifficulty.Notes.Count == 0)
            {
              continue;
            }
            diffNoteStorage.Add((byte)diff, instrumentDifficulty.Notes.Count);
            diffStarPowerStorage.Add((byte)diff, instrumentDifficulty.Phrases.Where(phrase => phrase.Type == PhraseType.StarPower).Count());
          }
          if (diffNoteStorage.Count == 0) continue;
          noteStorage.Add((byte)track.Instrument, diffNoteStorage);
          starPowerStorage.Add((byte)track.Instrument, diffStarPowerStorage);
        }
        Dictionary<string, object> chartDataStorage = new()
        {
            { "NoteCount", noteStorage },
            { "StarPowerCount", starPowerStorage }
        };
        output.Add("ChartData", chartDataStorage);
        output.Add("HopoFrequency", parseSettings.Value.HopoThreshold); // needed because DB stores hopo_frequency, but .ini might contain eighthNoteHopo/hopofreq instead
      }
      return output;
    }

    public static EngineValue GetEngineValue(ReplayFrame frame, ReplayInfo replayInfo)
    {
      var starMultiplierThreshold = frame.EngineParameters.StarMultiplierThresholds;
      BaseEngineParameters defaultEngine = EnginePreset.Default.ProKeys.Create(starMultiplierThreshold);
      BaseEngineParameters casualEngine = EnginePreset.Casual.ProKeys.Create(starMultiplierThreshold);
      BaseEngineParameters precisionEngine = EnginePreset.Precision.ProKeys.Create(starMultiplierThreshold);
      if (frame.EngineParameters is GuitarEngineParameters)
      {
        Instrument[] bass = [Instrument.FiveFretBass, Instrument.SixFretBass, Instrument.ProBass_17Fret, Instrument.ProBass_22Fret];
        bool isBass = bass.Contains(frame.Profile.CurrentInstrument);
        defaultEngine = EnginePreset.Default.FiveFretGuitar.Create(starMultiplierThreshold, isBass);
        casualEngine = EnginePreset.Casual.FiveFretGuitar.Create(starMultiplierThreshold, isBass);
        precisionEngine = EnginePreset.Precision.FiveFretGuitar.Create(starMultiplierThreshold, isBass);
      }
      else if (frame.EngineParameters is DrumsEngineParameters drumsEngineParameters)
      {
        defaultEngine = EnginePreset.Default.Drums.Create(starMultiplierThreshold, drumsEngineParameters.Mode);
        casualEngine = EnginePreset.Casual.Drums.Create(starMultiplierThreshold, drumsEngineParameters.Mode);
        precisionEngine = EnginePreset.Precision.Drums.Create(starMultiplierThreshold, drumsEngineParameters.Mode);
      }
      else if (frame.EngineParameters is VocalsEngineParameters vocalsEngineParameters)
      {
        defaultEngine = EnginePreset.Default.Vocals.Create(starMultiplierThreshold, frame.Profile.CurrentDifficulty, (float)vocalsEngineParameters.ApproximateVocalFps, vocalsEngineParameters.SingToActivateStarPower);
        casualEngine = EnginePreset.Casual.Vocals.Create(starMultiplierThreshold, frame.Profile.CurrentDifficulty, (float)vocalsEngineParameters.ApproximateVocalFps, vocalsEngineParameters.SingToActivateStarPower);
        precisionEngine = EnginePreset.Precision.Vocals.Create(starMultiplierThreshold, frame.Profile.CurrentDifficulty, (float)vocalsEngineParameters.ApproximateVocalFps, vocalsEngineParameters.SingToActivateStarPower);
      }
      defaultEngine.SongSpeed = replayInfo.SongSpeed;
      casualEngine.SongSpeed = replayInfo.SongSpeed;
      precisionEngine.SongSpeed = replayInfo.SongSpeed;
      if (EngineEqualityCheck(frame.EngineParameters, defaultEngine))
      {
        return EngineValue.Default;
      }
      else if (EngineEqualityCheck(frame.EngineParameters, casualEngine))
      {
        return EngineValue.Casual;
      }
      else if (EngineEqualityCheck(frame.EngineParameters, precisionEngine))
      {
        return EngineValue.Precision;
      }
      return EngineValue.Unknown;
    }

    public static bool EngineEqualityCheck(BaseEngineParameters a, BaseEngineParameters b)
    {
      return JsonConvert.SerializeObject(a) == JsonConvert.SerializeObject(b); // quite a bodge but screw it
    }
  }
}

