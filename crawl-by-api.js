// eslint-disable-next-line
const { API_OPTIONS, FILE_NAME } = require('./crawl-urls-by-api');
// eslint-disable-next-line
const fs = require('fs').promises;

const SIZE_PER_PAGE = 500;
const getPostDetail = async (id) => {
  // eslint-disable-next-line
  const response = await fetch(
    `https://api-posts.khmer24.com/feed/${id}?lang=en&fields=location,phone,photos,status,total_like,store,user,photo,category,description,is_like,posted_date,renew_date,object_specs,is_saved,is_job_applied,link,thumbnail,thumbnails,total_comment&functions=save,chat,like,apply_job,shipping,comment&meta=true`,
    API_OPTIONS,
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
  return response?.data;
};

const crawlData = async (package = 0) => {
  try {
    const carIds = await fs.readFile(FILE_NAME, 'utf8');
    const ids = JSON.parse(carIds);
    const start = package * SIZE_PER_PAGE;
    const end = start >= ids.length ? ids.length : start + SIZE_PER_PAGE;
    const cars = [];

    for (let i = start; i < end; i++) {
      const id = ids[i];
      const data = await getPostDetail(id);
      cars.push(new CarGeneral().deserializeByAPI(data));
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
    this.carId = data?.adId || data?.carId;
    this.price = data?.price;
    this.category = data?.category;
    this.type = this.getTypeByCategory(data?.category);
    this.location = data?.locations;
    this.posted = data?.posted;
    this.brand = data?.carMakes || data?.brand;
    this.model = data?.carModel || data?.model;
    this.year = data?.year;
    this.taxType = data?.taxType;
    this.condition = data?.condition;
    this.bodyType = data?.bodyType;
    this.fuel = data?.fuel;
    this.transmission = data?.transmission;
    this.color = data?.color;
    this.source = data?.source || 'kh24';
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
    return this;
  }
  getTypeByCategory(category) {
    const categoryKh24 = {
      'cars for sale': 'sale',
      'vehicles for rent': 'rent',
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
    this.brand = data?.object_specs?.['car-brand'].value;
    this.model = data?.object_specs?.['car-model'].value;
    this.year = data?.object_specs?.['car-year'].value;
    this.taxType = data?.object_specs?.['tax-type'].value;
    this.bodyType = data?.object_specs?.['body_type'].value;
    this.fuel = data?.object_specs?.['fuel'].value;
    this.transmission = data?.object_specs?.['transmission'].value;
    this.color = data?.object_specs?.['color'].value;
    this.source = 'kh24';
    this.year = data?.object_specs?.['car-year'].value;
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

  await fs.writeFile(`${num}_data.csv`, csvData, { flag: 'a' }, (err) => {
    if (err) {
      console.error('Error writing to CSV file:', err);
    } else {
      console.log('Cars appended to CSV file successfully.');
    }
  });
}
