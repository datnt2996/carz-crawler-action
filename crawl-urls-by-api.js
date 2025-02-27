// eslint-disable-next-line
const fs = require('fs');
const myHeaders = new Headers();
myHeaders.append('accept', '*/*');
myHeaders.append('accept-language', 'en-US,en;q=0.9,vi;q=0.8');
myHeaders.append('access-token', '');
myHeaders.append('display-type', 'desktop');
myHeaders.append('if-none-match', 'W/"2c216-7+ZfV6n5ho8uJBBdkvLzWwKxst0"');
myHeaders.append('origin', 'https://www.khmer24.com');
myHeaders.append('priority', 'u=1, i');
myHeaders.append('referer', 'https://www.khmer24.com/');
myHeaders.append(
  'sec-ch-ua',
  '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
);
myHeaders.append('sec-ch-ua-mobile', '?0');
myHeaders.append('sec-ch-ua-platform', '"macOS"');
myHeaders.append('sec-fetch-dest', 'empty');
myHeaders.append('sec-fetch-mode', 'cors');
myHeaders.append('sec-fetch-site', 'same-site');
myHeaders.append(
  'user-agent',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
);

const API_OPTIONS = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
};
const FILE_NAME = 'ids_output.txt';
const getPosts = async (offset) => {
  // eslint-disable-next-line
  const response = await fetch(
    `https://api-posts.khmer24.com/feed?fields=category,link,object_highlight_specs,condition&functions=save,chat,like,apply_job,shipping,banner,highlight_ads%5Bobject_highlight_specs%5D&filter_version=4&meta=true&offset=${offset}&limit=100&category=cars-and-vehicles&sortby&date&max_ad_price&min_ad_price&province&district&commune`,
    API_OPTIONS,
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(`${offset} - ${data.data.length}`);
      return data;
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
  return response?.data;
};

const TIME_ACTIONS = 500;
const PAGE_SIZE = 100;
const getAllUrls = async (timeActions = TIME_ACTIONS) => {
  const carIds = [];
  // const urls = [];
  for (let i = 0; i < timeActions; i++) {
    const data = await getPosts(i * PAGE_SIZE);
    data.forEach((item) => {
      item?.type === 'post' && carIds.push(item?.data?.id);
    });
    console.log(data?.[0]);
  }
  await writeToTxtFile(FILE_NAME, carIds);
  // await writeToTxtFile('output.txt', urls);
};

async function writeToTxtFile(name, data) {
  try {
    await fs.promises.writeFile(name, JSON.stringify(data, null, 2));
    console.log('Data written to output successfully.');
  } catch (error) {
    console.error('Error writing to File:', error);
  }
}

module.exports = {
  getAllUrls,
  API_OPTIONS,
  FILE_NAME,
};
