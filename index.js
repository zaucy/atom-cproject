const fs = require("fs")
    , spawn = require("child_process").spawn;

module.exports = {
  activate: activate,
  deactivate: deactivate,
  serialize: serialize
};

function CProject(settings) {
  if(typeof settings.buildDir == "string")
    this.buildDir = settings.buildDir;
  if(typeof settings.sourceDir == "string")
    this.sourceDir = settings.sourceDir;
  if(typeof settings.installPrefix == "string")
    this.installPrefix = settings.installPrefix;
}

CProject.prototype = {
  buildDir: "",
  sourceDir: "",
  installPrefix: "",

  configure: function() {
    var cmakeArgs = ["-G", "MinGW Makefiles"];
    if(this.buildDir) {
      cmakeArgs.push("-DCMAKE_BINARY_DIR="+this.buildDir);
    }
    if(this.sourceDir) {
      cmakeArgs.push("-DCMAKE_SOURCE_DIR="+this.buildDir);
    }
    if(this.installPrefix) {
      cmakeArgs.push("-DCMAKE_INSTALL_PREFIX="+this.installPrefix);
    }

    spawn("cmake", cmakeArgs, {
      cwd: process.cwd()
    });
  },

  build: function() {
    var buildDir = this.buildDir || ".";
    spawn("cmake", ["--build", "."], {
      cwd: buildDir
    });
  }

};

var cprojects = {

};

function initCProject(projectRoot) {
	console.log("initCProject: " + projectRoot.getPath());
	var projectPath = projectRoot.getPath();
	var projectName = projectRoot.getBaseName();
	var els = document.querySelectorAll(".name[data-name=\""+projectName+"\"]");
	var projectRootEl = null;

	for(var elIndex in els) {
		var el = els[elIndex];
		if(el.getAttribute("data-path") == projectPath) {
			projectRootEl = el;
			break;
		}
	}

	if(projectRootEl) {
		projectRootEl.parentElement.classList.add("cproject-root");
	}
}

function activate(state) {
  try {
    cprojects = JSON.parse(state);
  } catch(e) { cprojects = {}; }
  
	console.log("CProject Activate");

	var projectRootDirectory = null;
	var disposeOld = function() {};

	atom.contextMenu.add({
		".cproject-root": [
			{	label: "CProject",
				submenu: [
					{label: "Configure", command: "cproject:configure"},
					{label: "Build", command: "cproject:build"},
					{label: "Run", command: "cproject:run"}
				]
			}
		]
	});

	Object.defineProperty(atom.project, "rootDirectory", {
		get: function() {
			return projectRootDirectory;
		},
		set: function(dir) {
			disposeOld();
			projectRootDirectory = dir;

			function parseEntries() {
				if(projectRootDirectory) {
					projectRootDirectory.getEntries(function(error, entries) {
						if(error) console.log(error);

						for(var entryIndex in entries) {
							var entry = entries[entryIndex];
							if(entry.isFile()) {
								if(entry.getBaseName() == "CMakeLists.txt") {
									initCProject(projectRootDirectory);
									break;
								}
							}
						}
					});
				}
			}

			if(projectRootDirectory) {
				parseEntries();
				disposeOld = projectRootDirectory.onDidChange(parseEntries);
			}
		}
	});
}

function deactivate() {

}

function serialize() {
  return JSON.stringify(cprojects);
}
