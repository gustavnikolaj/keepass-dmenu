# keepass-dmenu

Keepass2 client for .kdbx files based on dmenu.

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

--label           Takes one argument; what property of the selected entry
                  you wish to return. You can select from the following
                  types of labels:
                   - password
                   - username
                   - url
                   - notes
                  [optional]
```
