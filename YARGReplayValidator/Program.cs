using YARG.Core;
using YARG.Core.Replays;
using YARG.Core.Game;
using YARG.Core.Engine;
using YARG.Core.Engine.Guitar;
using YARG.Core.Engine.Drums;
using YARG.Core.Engine.Vocals;
using Newtonsoft.Json;
using YARG.Core.Chart;
using YARG.Core.Replays.Analyzer;

// TODO: make these arg-based inputs
string _replayPath = @"path/to/file.replay";
var readMode = ReadMode.ReplayAndMidi;
string? chartPath = @"path/to/notes.mid";
bool isRb3con = false; // true if the song came from an rb3con; affects how the chart is parsed
// these ones will be fetched from the DB or song.ini and affect how the chart is parsed
bool proDrums = true;
bool fiveLaneDrums = false;
long? sustainCutoffThreshold = null;
int? multiplierNote = null;
long? hopoThreshold = null;
bool eighthNoteHopo = false;
int? hopofreq = null;
//
bool isChart = Path.GetExtension(chartPath) == ".chart";
ParseSettings parseSettings = getParseSettings(
    isChart, isRb3con, proDrums, fiveLaneDrums, sustainCutoffThreshold, multiplierNote, hopoThreshold, eighthNoteHopo, hopofreq, chartPath
);
ReplayInfo _replayInfo;
ReplayData _replayData;
Dictionary<string, object> result = [];
result = readReplay(result, _replayPath, readMode, chartPath, parseSettings);
Console.WriteLine(JsonConvert.SerializeObject(result));
Environment.Exit(1);

Dictionary<string, object> readReplay(Dictionary<string, object> storage, string _replayPath, ReadMode readMode, string? chartPath = null, ParseSettings? parseSettings = null)
{
    storage.Add("result", "error");
    SongChart? chart = null;
    if (readMode != ReadMode.ReturnSongHash)
    {
        if (chartPath is null || parseSettings is null)
        {
            storage.Add("data", "Missing MIDI path/parse settings!");
            return storage;
        }
        chart = SongChart.FromFile((ParseSettings)parseSettings, chartPath);
    }
   
    if (readMode != ReadMode.MidiOnly)
    {
        (var result, _replayInfo, _replayData) = ReplayIO.TryDeserialize(_replayPath);

        if (result != ReplayReadResult.Valid)
        {
            storage.Add("data", $"Failed to load replay. Read Result: {result}.");
            return storage;
        }
        if (_replayData.Frames.Length == 0)
        {
            storage.Add("data", "Replay doesn't contain any players!");
            return storage;
        }
        if (readMode == ReadMode.ReturnSongHash)
        {
            storage.Add("SongChecksum", _replayInfo.SongChecksum);
            storage["result"] = "success";
            return storage;
        }
        // validate replay
        var results = ReplayAnalyzer.AnalyzeReplay(chart, _replayData);
        var bandScore = results.Sum(x => x.ResultStats.TotalScore);
        if (bandScore != _replayInfo.BandScore)
        {
            if (results.Length != _replayData.Frames.Length)
            {
                storage.Add("data", "Analysis results and replay frames differ in size!");
            }
            else
            {
                // TODO: fetch and output differences for each replay frame
            }
            return storage;
            //
        }
        storage.Add("replayInfo", _replayInfo);
        List<object> frameStorage = [];
        for (int frameIndex = 0; frameIndex < _replayData.Frames.Length; frameIndex++)
        {
            Dictionary<string, object> thisFrameStorage = new()
            {
                { "profile", _replayData.Frames[frameIndex].Profile },
                { "stats", results[frameIndex].ResultStats }
            };
            var engine = getEngineValue(_replayData.Frames[frameIndex]);
            thisFrameStorage.Add("engine", engine);
            frameStorage.Add(thisFrameStorage);
        }
        storage.Add("replayData", frameStorage);
    }
    if (readMode == ReadMode.MidiOnly || readMode == ReadMode.ReplayAndMidi)
    {
        Dictionary<byte, Dictionary<byte, long>> noteStorage = [];
        Dictionary<byte, Dictionary<byte, long>> starPowerStorage = [];
        // fetch chart data
        foreach (var track in chart.FiveFretTracks)
        {
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
            { "noteCount", noteStorage },
            { "starPowerCount", starPowerStorage }
        };
        storage.Add("chartData", chartDataStorage);
        storage.Add("hopo_frequency", parseSettings.Value.HopoThreshold); // needed because DB stores hopo_frequency, but .ini might contain eighthNoteHopo/hopofreq instead
    }
    storage["result"] = "success";
    return storage;
}

ParseSettings getParseSettings(bool isChart, bool isRb3con = false, bool proDrums = true, bool fiveLaneDrums = false, long? sustainCutoffThreshold = null, int? multiplierNote = null, long? hopoThreshold = null, bool eighthNoteHopo = false, int? hopofreq = null, string? chartPath = null)
{
    var parseSettings = isChart ? ParseSettings.Default_Chart : ParseSettings.Default_Midi;
    parseSettings.DrumsType = DrumsType.FourLane;
    //
    parseSettings.ChordHopoCancellation = !isChart;
    parseSettings.NoteSnapThreshold = isRb3con ? 10 : 0;
    if (fiveLaneDrums) parseSettings.DrumsType = DrumsType.FiveLane;
    //else if (proDrums) parseSettings.DrumsType = DrumsType.ProDrums;
    //
    if (sustainCutoffThreshold is not null) parseSettings.SustainCutoffThreshold = (long)sustainCutoffThreshold;
    if (multiplierNote is not null) parseSettings.StarPowerNote = (int)multiplierNote;
    if (hopoThreshold is not null) parseSettings.HopoThreshold = (long)hopoThreshold;
    else if ((eighthNoteHopo || hopofreq is not null) && chartPath is not null)
    {
        if  (!File.Exists(chartPath))
        {
            throw new NotImplementedException($"Chart not included!");
        }
        var chart = SongChart.FromFile(parseSettings, chartPath);
        var resolution = chart.Resolution;
        if (eighthNoteHopo)
        {
            parseSettings.HopoThreshold = resolution / 2;
        } else
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

EngineValue getEngineValue(ReplayFrame frame)
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
    defaultEngine.SongSpeed = _replayInfo.SongSpeed;
    casualEngine.SongSpeed = _replayInfo.SongSpeed;
    precisionEngine.SongSpeed = _replayInfo.SongSpeed;
    if (engineEqualityCheck(frame.EngineParameters, defaultEngine))
    {
        return EngineValue.Default;
    }
    else if (engineEqualityCheck(frame.EngineParameters, casualEngine))
    {
        return EngineValue.Casual;
    }
    else if (engineEqualityCheck(frame.EngineParameters, precisionEngine))
    {
        return EngineValue.Precision;
    }
    return EngineValue.Unknown;
}

bool engineEqualityCheck(BaseEngineParameters a, BaseEngineParameters b)
{
    return JsonConvert.SerializeObject(a) == JsonConvert.SerializeObject(b); // quite a bodge but screw it
}

enum ReadMode : short
{
    ReplayOnly = 0, // validates replay only
    ReplayAndMidi = 1, // parses replay and includes midi data
    MidiOnly = 2, // parses midi data
    ReturnSongHash = 3 // returns song hash and nothing else
}

enum EngineValue : short
{
    Default = 0,
    Casual = 1,
    Precision = 2,
    Unknown = -1
}