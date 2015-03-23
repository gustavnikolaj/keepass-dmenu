# keepass-dmenu

Keepass2 client for .kdbx files based on dmenu.

It is only meant for read access to the file, so you still need a full
GUI client to do your editing and changing of password entries.

## Usage

Minimal working invocation is shown below:

```
$ keepass-dmenu --database path/to/database.kdbx
```

All command line options:

```
--database        Takes the path to the database file, relative from
                  your current working directory or as an absolute path.
                  [required]

--password        Takes one argument; the password to the given file.
                  Mostly useful for debugging. If it is not provided,
                  it will prompt for the password using dmenu.
                  [optional]

--cache-password  Takes one argument; the number of seconds in which the
                  password should be remembered. If 0 is given or the
                  option is not given, you will be prompted for the
                  master password on every invocation.
                  [optional]

--label           Takes one argument; what property of the selected entry
                  you wish to return. You can select from the following
                  types of labels:
                   - password
                   - username
                   - url
                   - notes
                  [optional]

--clear-clipboard Takes one argument; how many seconds before emptying the
                  clipboard. If 0 is given, the clipboard will not be
                  cleared. Default value i 10 seconds.

```

The following styling options is propagated to dmenu. (Note the double
dashes in front of the options - dmenu only uses one for the
corresponding options.)

```
--fn font
      defines the font or font set used. eg. "fixed" or
      "Monospace-12:normal" (an xft font)
--nb color
      defines the normal background color.  #RGB, #RRGGBB, and X color
      names are supported.
--nf color
      defines the normal foreground color.
--sb color
      defines the selected background color.
--sf color
      defines the selected foreground color.
```

## Installation

It can be installed by running the following command in your terminal:
```
$ npm install -g keepass-dmenu
```

## Requirements

The following software should be installed:
 - node.js
 - npm
 - dmenu
 - xsel

## Compatability

The implementation is only tested on Ubuntu 14.10, with i3wm. It
should work under any window manager on any linux system as long as
dmenu is available.

If you encounter problems that is related to this code I will
willingly accept any pull requests as long as they are reasonable. And
if you need an extra eye on a problem feel free to open an issue.

## License

This module is made public under the ISC License.

See the [LICENSE](LICENSE) file for additional details.

### Getting it playing nice with i3

I am using nvm to manage node, and that screwed me over and resulted
in me wasting some hours getting it working properly with i3.

i3 doesn't read your `$PATH` environment variable as bash does. So you
need to source the file that sets up nvm in your bash
environment. Usually the nvm install script will place that line in
the end of your .bashrc file. You should source it in the .profile
dotfile as that will be loaded by the desktop environment.
