# Fenced Code Blocks Tools

Adds features to markdown codeblocks

### Features
#### Copy Code
- Enables a copy button on the code block in markdown files to copy the code
#### Run Code
- Enables a run button on the code block in markdown files to run the code in the current active terminal (Opens new terminal if there is no existing)
- Currently supported languages are
  - Bash/Shell Script (Default)
  - JavaScript
  - Apex (Pre-requisite : sfdx)
  - SOQL (Pre-requisite : sfdx)

<!-- #### Replace variables
- Makes code block configurable by replacing the variables -->

### Configuration
##### Disable Run Button
By default the run button will be displayed on every code block, this setting will help in disabling the run button.

##### Clear Terminal Before Run
Clears the terminal before executing run. By default this is disabled.
