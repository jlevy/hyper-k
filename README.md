# hyper-k

Hyper-k is a plugin for the [Hyper](https://hyper.is/) terminal to make it much
more usable than a regular terminal:

- Click-to-paste commands if they appear in the terminal, based on backtick expressions. For example, if \`ls -l\` appears in the terminal, you can click on it and it will type that command on the command line.

- Click-to-paste filenames for common filename patterns. For example, if `some-folder/some-file.txt` appears in the terminal, you can click on it to type that path.

- Lines of text within Markdown fenced blocks are also click-to-paste. This means it's easy for help docs to give example code blocks that are clickable line by line.

- Auto-view popover of image URLs in terminal. Image appears in upper right. Hit escape or backspace to close image popover.
 
- Clickable URLs (Hyper has this by default).

These seem like small features but it makes for a useful base for a better
command-line experience for many workflows

Under development but works locally.

First, install Hyper.

Then:

```bash
cd hyper-k
mkdir -p ~/.hyper_plugins/local
ln -s `pwd` ~/.hyper_plugins/local
# Now add "hyper-k" to "localPlugins" in ~/.hyper.js and restart Hyper.
```
