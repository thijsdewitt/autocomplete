// To learn more about Fig's autocomplete standard visit: https://fig.io/docs/concepts/cli-skeleton

const fileExists = async (
  executeCommand: Fig.ExecuteCommandFunction,
  file: string
) => {
  return (
    // eslint-disable-next-line @withfig/fig-linter/no-useless-arrays
    (await executeCommand({ command: "ls", args: [file] })).status === 0
  );
};

const completionSpec: Fig.Spec = {
  name: "php",
  description: "Run the PHP interpreter",
  generateSpec: async (tokens, executeShellCommand) => {
    const subcommands = [];

    if (await fileExists(executeShellCommand, "artisan")) {
      subcommands.push({ name: "artisan", loadSpec: "php/artisan" });
    }
    if (await fileExists(executeShellCommand, "please")) {
      subcommands.push({ name: "please", loadSpec: "php/please" });
    }
    if (await fileExists(executeShellCommand, "bin/console")) {
      subcommands.push({
        name: "bin/console",
        loadSpec: "php/bin-console",
      });
    }
    if (await fileExists(executeShellCommand, "bin/magento")) {
      subcommands.push({
        name: "bin/magento",
        icon: "https://www.svgrepo.com/download/303592/magento-2-logo.svg",
        loadSpec: "php/bin-magento",
      });
    }

    return {
      name: "php",
      subcommands,
      args: {
        generators: {
          template: "filepaths",
          filterTemplateSuggestions: function (suggestions) {
            return suggestions.filter((suggestion) => {
              return (
                // suggestion.name.endsWith(".php") ||
                suggestion.name.indexOf(".") === -1
              );
            });
          },
        },
      },
    };
  },
};

export default completionSpec;
