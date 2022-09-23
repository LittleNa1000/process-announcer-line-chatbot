const csv = require("@fast-csv/parse");

csv
  .parseFile("./resources/test.csv", { headers: true })
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    console.log(`ROW=${JSON.stringify(row)}`);
  })
  .on("end", (rowCount) => console.log(`Parsed ${rowCount} rows`));
