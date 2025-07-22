using Newtonsoft.Json;
using CommandLine;
using static YARGReplayValidator;

public class Program
{
  public class ArgParseOptions
  {
    [Value(0, Required = true, HelpText = "The REPLAY file to be validated.")]
    public required string ReplayFilePath { get; set; }
    [Value(1, Required = false, HelpText = "The chart of the song.")]
    public string? ChartFilePath { get; set; }
  }

  public static void InitYARGReplayValidator(ArgParseOptions options)
  {
    var readMode = ReadMode.ReplayAndMidi;
    bool isRB3CON = false;
    bool proDrums = false;
    bool fiveLaneDrums = false;
    long? sustainCutoffThreshold = null;
    int? multiplierNote = null;
    long? hopoThreshold = null;
    bool eighthNoteHopo = false;
    int? hopofreq = null;

    bool isChart = Path.GetExtension(options.ChartFilePath) == ".chart";
    try
    {
      var parseSettings = GetParseSettings(
      isChart, isRB3CON, proDrums, fiveLaneDrums, sustainCutoffThreshold, multiplierNote, hopoThreshold, eighthNoteHopo, hopofreq, options.ChartFilePath
    );

      var result = ReadReplay(options.ReplayFilePath, readMode, options.ChartFilePath, parseSettings);
      Console.WriteLine(JsonConvert.SerializeObject(result));
      Environment.Exit(0);
    }
    catch (Exception e)
    {
      Console.Error.WriteLine(e);
    }
    finally
    {
      Environment.Exit(1);
    }
  }

  public static void Main(string[] args)
  {
    Parser.Default.ParseArguments<ArgParseOptions>(args)
    .WithParsed(InitYARGReplayValidator);
  }
}
