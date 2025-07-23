using Newtonsoft.Json;
using CommandLine;
using YARGReplayValidator.Core;

var parser = new Parser(settings => settings.HelpWriter = null);
parser.ParseArguments<ArgParseOptions>(args)
.WithParsed(InitYARGReplayValidator)
.WithNotParsed(errs => ArgErrorsFallback(args, errs));

static void InitYARGReplayValidator(ArgParseOptions options)
{
  try
  {
    if (!Path.Exists(options.ReplayFilePath)) throw new FileNotFoundException($"Provided REPLAY file \"{options.ReplayFilePath}\" does not exists.");
    if (options.ChartFilePath != null && !Path.Exists(options.ChartFilePath)) throw new FileNotFoundException($"Provided CHART/MIDI file \"{options.ChartFilePath}\" does not exists.");

    var readMode = options.ReadMode;
    bool isRB3CON = options.IsRB3CON;
    bool proDrums = options.ProDrums;
    bool fiveLaneDrums = options.FiveLaneDrums;
    long? sustainCutoffThreshold = options.SustainCutoffThreshold;
    int? multiplierNote = options.MultiplierNote;
    long? hopoThreshold = options.HopoThreshold;
    bool eighthNoteHopo = options.EighthNoteHopo;
    int? hopofreq = options.HopoFreq;
    
    bool isChart = Path.GetExtension(options.ChartFilePath) == ".chart";

    var parseSettings = YARGReplayValidatorCore.GetParseSettings(
    isChart, isRB3CON, proDrums, fiveLaneDrums, sustainCutoffThreshold, multiplierNote, hopoThreshold, eighthNoteHopo, hopofreq, options.ChartFilePath
  );

    var result = YARGReplayValidatorCore.ReadReplay(options.ReplayFilePath, readMode, options.ChartFilePath, parseSettings);
    Console.WriteLine(JsonConvert.SerializeObject(result));
    Environment.Exit(0);
  }
  catch (Exception e)
  {
    ExceptionsFallback(e);
  }
  finally
  {
    Environment.Exit(1);
  }
}

static void ArgErrorsFallback(string[] args, IEnumerable<Error> errs)
{
  Console.WriteLine("YARG Replay Validator v0.1");
  Console.WriteLine("To show help: --help\n");

  int argsCount = args.Length;
  int errsCount = errs.Count();
  // Console.WriteLine($"argsCount: {argsCount}\nerrsCount: {errsCount}");
  if (argsCount == 0)
  {
    Console.WriteLine("ERROR:");
    Console.WriteLine("No arguments provided.");
    Environment.Exit(1);
  }
  else if (args.Contains("--help"))
  {
    Console.WriteLine("ARGUMENTS:");
    Console.WriteLine("(pos. arg 1)         | ReplayFilePath:");
    Console.WriteLine("Path                 | The REPLAY file to be validated.\n");
    Console.WriteLine("(pos. arg 2)         | ChartFilePath:");
    Console.WriteLine("Path? (OPTIONAL)     | The chart of the song.");
    Console.WriteLine("                     |");
    Console.WriteLine("                     | Required argument when using certain read modes.\n");
    Console.WriteLine("-m --read-mode       | The reading mode where this module will perform.");
    Console.WriteLine("short                |");
    Console.WriteLine("                     |");
    Console.WriteLine("0                    | Validates REPLAY only.");
    Console.WriteLine("1                    | Parses REPLAY and includes MIDI data (default).");
    Console.WriteLine("2                    | Parses MIDI data only.");
    Console.WriteLine("3                    | Returns song hash only.\n");
    Environment.Exit(0);
  }
  else if (errsCount > 0)
  {
    if (errsCount > 1) Console.WriteLine("ERRORS:");
    else Console.WriteLine("ERROR:");

    foreach (var err in errs)
    {

      if (err is BadFormatConversionError e)
      {
        if (e.NameInfo.LongName == "read-mode")
        {
          Console.WriteLine("Provided read mode value is not valid.\nValid values: 0, 1, 2, 3.");
        }
      }
    }
  }
}

static void ExceptionsFallback(Exception e)
{
  Console.WriteLine("YARG Replay Validator v0.1");
  Console.WriteLine("To show help: --help\n");

  Console.WriteLine("ERROR:");
  Console.WriteLine(e.Message);

}

class ArgParseOptions
{
  [Value(0, MetaName = "ReplayFilePath", Required = true)]
  public required string ReplayFilePath { get; set; }
  [Value(1, MetaName = "ChartFilePath", Required = false)]
  public string? ChartFilePath { get; set; }
  [Option('m', "read-mode", Required = false, Default = ReadMode.ReplayAndMidi)]
  public ReadMode ReadMode { get; set; }
  [Option('c', "is-rb3con", Required = false, Default = false)]
  public bool IsRB3CON { get; set; }
  [Option('p', "pro-drums", Required = false, Default = false)]
  public bool ProDrums { get; set; }
  [Option('b', "five-lane-drums", Required = false, Default = false)]
  public bool FiveLaneDrums { get; set; }
  [Option('s', "sus-cutoff-threshold", Required = false)]
  public long? SustainCutoffThreshold { get; set; }
  [Option('m', "multiplier-note", Required = false)]
  public int? MultiplierNote { get; set; }
  [Option('h', "hopo-threshold", Required = false)]
  public long? HopoThreshold { get; set; }
  [Option('e', "eighth-note-hopo", Required = false, Default = false)]
  public bool EighthNoteHopo { get; set; }
  [Option('f', "hopo-freq", Required = false)]
  public int? HopoFreq { get; set; }
}