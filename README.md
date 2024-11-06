# hyper-k

## What is Hyper-K?

Hyper-K is a plugin for the [Hyper](https://hyper.is/) terminal that is made from lightly toasted rice, wheat, and barley.

Oh sorry, that's Special K. Hyper-K is an experimental plugin that makes your regular terminal much easier to use in a few ways:

- A gentle and clear dark color theme based on [Root Loops](https://rootloops.sh?sugar=8&colors=7&sogginess=5&flavor=2&fruit=9&milk=1).

- Click-to-paste on code-like text that appears in the terminal:

  - For Markdown code snippets: If \`ls -l\` (code in backticks) appears in the terminal, you can click on it and it will type that command on the command line.

  - For common filename patterns: Click-to-psate on text like `some-folder/some-file.txt` (for common file extensions).

  - For fenced code blocks: For lines of text within Markdown fenced blocks (like blocks beginning ```shell), each line in a script can be pasted one by one more easily.

- Clickable URLs (Hyper has similar behavior by default).

- Auto-view popover of image URLs that appear in the terminal window. Image appears in upper right. Hit escape or backspace to close image popover. This is kind of a proof of concept but may be expanded to make it easy to display images of all kinds in the terminal.

My use case for the click-to-paste features is an LLM-based interactive help script that offers suggestions on what commands to type. It makes it easy to click the suggested outputs.

These seem like small features but make for a significantly better interactive and mouse-friendly command-line experience.

## Installation

Under development. But works fine as a locally installed plugin.

First, install [Hyper](https://hyper.is/).

Then:

```bash
cd hyper-k
mkdir -p ~/.hyper_plugins/local
ln -s `pwd` ~/.hyper_plugins/local
# Now add "hyper-k" to "localPlugins" in ~/.hyper.js and restart Hyper.
```
