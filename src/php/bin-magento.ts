const cacheTypes: Fig.Generator = {
  script: [
    "php",
    "-r",
    "print(json_encode((require 'app/etc/env.php')['cache_types']));",
  ],
  postProcess: (out) => {
    const cacheTypes = JSON.parse(out);
    return Object.keys(cacheTypes).map((cacheType) => {
      return {
        name: cacheType,
        description: "Cache type",
      };
    });
  },
};

const indexes: Fig.Generator = {
  script: ["php", "bin/magento", "index:info"],
  postProcess: (out) => {
    return out
      .trim()
      .split("\n")
      .map((indexer) => {
        const name = indexer.slice(0, 40).trim();
        const description = indexer.slice(40).trim();
        return {
          name,
          description,
        };
      });
  },
};

const completionSpec: Fig.Spec = {
  name: "bin-magento",
  description: "Magento CLI tool",
  generateSpec: async (_, executeShellCommand) => {
    var { stdout } = await executeShellCommand({
      command: "php",
      args: ["bin/magento", "list", "--format=json"],
    });
    const subcommands: Fig.Subcommand[] = [];

    try {
      const commandDefinition = JSON.parse(stdout);

      commandDefinition.commands.forEach((command) => {
        subcommands.push({
          name: command.name,
          description: command.description,
          deprecated: command.description.toLowerCase().includes("deprecated"),
          icon: "https://www.svgrepo.com/download/303592/magento-2-logo.svg",
          args: Object.keys(command.definition.arguments).map((argumentKey) => {
            const argument = command.definition.arguments[argumentKey];
            const generators: Fig.Generator[] = [];
            const suggestions: Fig.Suggestion[] = [];

            if (
              command.name.startsWith("cache:") &&
              argument.name === "types"
            ) {
              generators.push(cacheTypes);
            }

            if (
              command.name.startsWith("indexer:") &&
              argument.name === "index"
            ) {
              generators.push(indexes);
            }

            if (command.name === "deploy:mode:set") {
              suggestions.push({
                name: "developer",
                description: "Developer mode",
              });
              suggestions.push({
                name: "production",
                description: "Production mode",
              });
            }

            return {
              name: argument.name,
              description: argument.description,
              isOptional: !argument.is_required,
              isVariadic: argument.is_array,
              generators,
              suggestions,
            };
          }),
          options: Object.keys(command.definition.options).map((optionKey) => {
            const option = command.definition.options[optionKey];
            const names = [option.name];

            if (option.shortcut !== "") {
              names.push(option.shortcut);
            }

            return {
              name: names,
              description: option.description,
              deprecated: option.description
                .toLowerCase()
                .includes("deprecated"),
            };
          }),
        });
      });
    } catch (err) {
      //
    }

    return {
      name: "bin-magento",
      debounce: true,
      subcommands,
    } as Fig.Spec;
  },
};

export default completionSpec;
