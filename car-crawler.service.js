const cheerio = require("cheerio");
const { camelcase } = require("camelcase-input");
const fs = require("fs");

class CarGeneral {
  carId;

  price;

  category;

  type;

  location;

  posted;

  brand;

  model;

  year;

  taxType;

  condition;

  bodyType;

  fuel;

  transmission;

  color;

  source;

  _id;

  createdAt;

  updatedAt;

  constructor(data = {}) {
    if (data) {
      this._id = data?._id;
      this.carId = data?.carId;
      this.price = data?.price;
      this.type = data?.type;
      this.category = data?.category;
      this.location = data?.location;
      this.posted = data?.posted;
      this.brand = data?.brand;
      this.model = data?.model;
      this.year = data?.year;
      this.taxType = data?.taxType;
      this.condition = data?.condition;
      this.bodyType = data?.bodyType;
      this.fuel = data?.fuel;
      this.transmission = data?.transmission;
      this.color = data?.color;
      this.source = data?.source;
      this.createdAt = data?.createdAt;
      this.updatedAt = data?.updatedAt;
    }
  }

  deserializeKh24(data) {
    this._id = data?._id;
    this.carId = data?.adId;
    this.price = data?.price;
    this.category = data?.category;
    this.type = this.getTypeByCategory(data?.category);
    this.location = data?.locations;
    this.posted = data?.posted;
    this.brand = data?.carMakes;
    this.model = data?.carModel;
    this.year = data?.year;
    this.taxType = data?.taxType;
    this.condition = data?.condition;
    this.bodyType = data?.bodyType;
    this.fuel = data?.fuel;
    this.transmission = data?.transmission;
    this.color = data?.color;
    this.source = data?.source || "kh24";
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
    return this;
  }
  getTypeByCategory(category) {
    const categoryKh24 = {
      "cars for sale": "sale",
      "vehicles for rent": "rent",
    };
    return categoryKh24[category?.trim()] || null;
  }
}

async function kh24(page) {
  try {
    const result = await fetch(`https://www.khmer24.com/en/c-cars-and-vehicles?per_page=${page}`);
    const html = await result.text();
    const $ = cheerio.load(html);

    const links = $("a");

    const matchLinks = [];
    links.each((_, value) => {
      const link = $(value).attr("href");
      if (link.includes("adid")) {
        matchLinks.push(link);
      }
    });

    const cars = [];
    for (let i = 0; i < matchLinks.length; i++) {
      const url = matchLinks[i];
      const car = await getItem(url);
      cars.push(car);
    }
    const results = camelcase(cars, { deep: false });
    // console.log(JSON.stringify(results));
    return results;
  } catch (error) {
    console.log("ERROR IN CALL API kh24", error);
  }
}

async function getItem(url) {
  try {
    const result = await fetch(url);
    const html = await result.text();
    const $ = cheerio.load(html);
    const titleSpan = $("span.title");
    const valueSpan = $("span.value");
    const p = $("b.price");
    const car = {
      price: parseInt(p.text().replace(",", "").replace("$", "") || "0") || 0,
    };
    titleSpan.each((i, element) => {
      const title = $(element).text().replace(":", "").trim();
      Object.assign(car, {
        [title]: $(valueSpan[i]).text().toLowerCase(),
      });
    });
    return car;
  } catch (error) {
    console.log("ERROR IN GET ITEM", error);
  }
}

async function createData() {
  let total = 0;
  try {
    await fs.unlinkSync("./cars-data-crawler.csv");
  } catch (error) {}

  while (total <= 32200) {
    console.log(`PAGE - ${total}`);
    const cars = await kh24(total);
    const data = [];

    console.log("INSERTED LENGTH ", cars.length);
    for (let i = 0; i < cars.length; i++) {
      const car = new CarGeneral().deserializeKh24(cars[i]);
      data.push(car);
    }
    await writeCarsToCSV(data);
    total = total + 50;
  }
}
async function writeCarsToCSV(cars) {
  let csvData = "";

  cars.forEach((car) => {
    const carData = `${car.carId || ""},${car.price || ""},${car.category || ""},${car.type || ""},${
      car.location || ""
    },${car.posted || ""},${car.brand || ""},${car.model || ""},${car.year || ""},${car.taxType || ""},${
      car.condition || ""
    },${car.bodyType || ""},${car.fuel || ""},${car.transmission || ""},${car.color || ""},${
      car.source || ""
    },${car._id || ""},${car.createdAt || ""},${car.updatedAt || ""}\n`;
    csvData += carData;
  });

  await fs.writeFile("./cars-data-crawler.csv", csvData, { flag: "a" }, (err) => {
    if (err) {
      console.error("Error writing to CSV file:", err);
    } else {
      console.log("Cars appended to CSV file successfully.");
    }
  });
}
createData();

// function readCarsFromCSV() {
//   fs.readFile("./cars-data-crawler.csv", "utf8", (err, data) => {
//     if (err) {
//       console.error("Error reading CSV file:", err);
//     } else {
//       console.log(data);
//       // Process the data from the CSV file
//     }
//   });
// }

// readCarsFromCSV();
