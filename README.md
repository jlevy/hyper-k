# hyper-easy

Some useful conveniences for [Hyper](https://hyper.is/) to make it much more usable
than a regular terminal.

- Click-to-type commands if they appear in the terminal, based on backtick expressions. For example, if \`ls -l\` appears in the terminal, you can click on it and it will type that command on the command line.
- Click-to-type filenames for common filename patterns. For example, if `some-folder/some-file.txt` appears in the terminal, you can click on it to type that path.
- Auto-view popover of image URLs in terminal.
- Clickable URLs.

Under development but works locally.

First, install Hyper.

Then:

```bash
cd hyper-easy
mkdir -p ~/.hyper_plugins/local
ln -s `pwd` ~/.hyper_plugins/local
# Now add "hyper-easy" to "localPlugins" in ~/.hyper.js and restart Hyper.
```
