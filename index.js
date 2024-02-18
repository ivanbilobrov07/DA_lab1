import { input, select } from "@inquirer/prompts";
import XLSXChart from "xlsx-chart";
import fs from "fs";

const source = await select({
  message: "How do you want to input text",
  choices: [
    {
      name: "By the link to the file",
      value: "link",
    },
    {
      name: "By the location of the file",
      value: "file",
    },
  ],
});

let userInput = "";

switch (source) {
  case "link":
    while (true) {
      try {
        const link = await input({ message: "Enter link" });
        userInput = await (await fetch(link)).text();
        break;
      } catch (e) {
        console.log("Invalid url");
        continue;
      }
    }
    break;
  case "file":
    while (true) {
      try {
        const location = await input({ message: "Enter location" });
        userInput = fs.readFileSync(location, "utf8");
        break;
      } catch (e) {
        console.error("Invalid location");
        continue;
      }
    }
    break;
}

const calculateSymbolsAmount = (text) => {
  const amountOfSymbols = text.length;
  const symbols = [];

  if (!amountOfSymbols) {
    throw new Error("There was no symbols");
  }

  text.split("").forEach((symbol) => {
    if (symbol === "\r" || symbol === "\n") {
      return;
    }

    const storedSymbol = symbols.find((item) => item.value === symbol);

    if (storedSymbol) {
      storedSymbol.count += 1;
      return;
    }

    symbols.push({
      value: symbol,
      count: 1,
    });
  });

  const sortedSymbols = symbols
    .map((symbol) => ({
      ...symbol,
      frequency: symbol.count / amountOfSymbols,
    }))
    .sort((a, b) => b.count - a.count);

  console.log(sortedSymbols);

  return sortedSymbols;
};

try {
  const symbols = calculateSymbolsAmount(userInput);

  console.log(`Max - \"${symbols[0].value}\"`);
  console.log(`Min - \"${symbols[symbols.length - 1].value}\"`);

  const xlsxChart = new XLSXChart();

  const config = {
    file: "table.xlsx",
    chart: "column",
    titles: ["Count", "Frequency"],
    fields: symbols.map((s) => s.value),
    data: {
      Count: Object.fromEntries(symbols.map((s) => [s.value, s.count])),
      Frequency: Object.fromEntries(symbols.map((s) => [s.value, s.frequency])),
    },
  };

  xlsxChart.writeFile(config, () => {});
} catch (error) {
  console.log(error.message);
}
