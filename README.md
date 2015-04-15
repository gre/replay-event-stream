replay-event-stream
===================
Mock server which replays an EventStream recording in a file.

## Usage

First record Server Sent Event stream:

```
curl http://URL.OF.THE/STREAM > stream.txt
```

then starts:

```
replay-event-stream stream.txt
```

and you can just consume `http://localhost:8888/`.

## Options

```
Usage: cmd <recorded file> [options]

Options:

  -h, --help                            output usage information
  -V, --version                         output the version number
  -r, --rate [rate]                     Rate at which speed the stream must go (in messages/sec)
  -v, --rate-variation [rateVariation]  A value in [0.0,1.0[ which indicates the randomness of the rate
  -p, --port [port]                     Port to run the server on.
```

## Known bug

For some reason, the rate doesn't work when the message interval is greater than ~ 500ms (number approximation issue?).
