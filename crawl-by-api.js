// eslint-disable-next-line
const { API_OPTIONS, FILE_NAME } = require('./crawl-urls-by-api');
// eslint-disable-next-line
const fs = require('fs').promises;

const SIZE_PER_PAGE = 500;
const FILE_OUTPUT_NAME = 'cars-data-crawler.csv';
const getPostDetail = async (id) => {
  // eslint-disable-next-line
  const response = await fetch(
    `https://api-posts.khmer24.com/feed/${id}?lang=en&fields=location,phone,photos,status,total_like,store,user,photo,category,description,is_like,posted_date,renew_date,object_specs,is_saved,is_job_applied,link,thumbnail,thumbnails,total_comment&functions=save,chat,like,apply_job,shipping,comment&meta=true`,
    API_OPTIONS,
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, car id: ${id}`,
        );
      }
      return response.json();
    })
    .catch((error) => {
      console.log('ERROR IN CRAWL DATA', error?.message);
    });
  return response?.data;
};

const crawlData = async (package = 0) => {
  try {
    const carIds = await fs.readFile(FILE_NAME, 'utf8');
    const ids = JSON.parse(carIds);
    const start = package * SIZE_PER_PAGE;
    const end =
      start + SIZE_PER_PAGE >= ids.length ? ids.length : start + SIZE_PER_PAGE;
    const cars = [];
    await writeHeaderToCSV(package);

    for (let i = start; i < end; i++) {
      const id = ids[i];
      const data = await getPostDetail(id);
      if (data) {
        const car = new CarGeneral().deserializeByAPI(data);
        console.log('car', car.carId, car.price);
        cars.push(car);
      }
    }
    await writeCarsToCSV(cars, package);
  } catch (error) {
    console.log('ERROR IN CRAWL DATA', error);
  }
};

module.exports = {
  getPostDetail,
  crawlData,
};

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
      Object.assign(this, data);
    }
  }

  getTypeByCategory(category) {
    const categoryKh24 = {
      'cars for sale': 'sale',
      'vehicles for rent': 'rent',
      'Cars for Sale': 'sale',
      'Vehicles for Rent': 'rent',
    };
    return categoryKh24[category?.trim?.()] || null;
  }

  deserializeByAPI(data) {
    this.carId = data?.id;
    this.price = Number(data?.price);
    this.category = data?.category?.en_name;
    this.type = this.getTypeByCategory(this.category);
    this.location = data?.location?.en_name;
    this.posted = data?.posted;
    this.condition = data?.condition?.value;
    this.brand = data?.object_specs?.['car-brand']?.value;
    this.model = data?.object_specs?.['car-model']?.value;
    this.year = data?.object_specs?.['car-year']?.value;
    this.taxType = data?.object_specs?.['tax-type']?.value;
    this.bodyType = data?.object_specs?.['body_type']?.value;
    this.fuel = data?.object_specs?.['fuel']?.value;
    this.transmission = data?.object_specs?.['transmission']?.value;
    this.color = data?.object_specs?.['color']?.value;
    this.source = 'kh24';
    this.year = data?.object_specs?.['car-year']?.value;
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
    return this;
  }
}

function getRow(car) {
  return `${car.carId || ''},${car.price || ''},${car.category || ''},${
    car.type || ''
  },${car.location || ''},${car.posted || ''},${car.brand || ''},${
    car.model || ''
  },${car.year || ''},${car.taxType || ''},${car.condition || ''},${
    car.bodyType || ''
  },${car.fuel || ''},${car.transmission || ''},${car.color || ''},${
    car.source || ''
  },${car._id || ''},${car.createdAt || ''},${car.updatedAt || ''}\n`;
}

async function writeCarsToCSV(cars, num = 0) {
  let csvData = '';
  cars.forEach((car) => {
    csvData += getRow(car);
  });
  await fs.writeFile(
    `${num}.${FILE_OUTPUT_NAME}`,
    csvData,
    { flag: 'a' },
    (err) => {
      if (err) {
        console.error('Error writing to CSV file:', err);
      } else {
        console.log('Cars appended to CSV file successfully.');
      }
    },
  );
}

async function writeHeaderToCSV(num = 0) {
  try {
    await fs.unlinkSync(FILE_NAME);
  } catch (error) {}
  const headers = [
    'carId',
    'price',
    'category',
    'type',
    'location',
    'posted',
    'brand',
    'model',
    'year',
    'taxType',
    'condition',
    'bodyType',
    'fuel',
    'transmission',
    'color',
    'source',
  ];
  const csvData = headers.join(',') + '\n';
  await (0, fs.writeFile)(`${num}.${FILE_NAME}`, csvData, (err) => {
    if (err) {
      console.error('Error writing to CSV file:', err);
    } else {
      console.log('CSV file header written successfully.');
    }
  });
}
