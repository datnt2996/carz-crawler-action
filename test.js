
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

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
};
const getPostDetail = async (id) => {
  // eslint-disable-next-line
  const response = await fetch(
    `https://api-posts.khmer24.com/feed/${id}`,
    requestOptions,
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
  return response?.data;
};
const getPosts = async (offset) => {
  // eslint-disable-next-line
  const response = await fetch(
    `https://api-posts.khmer24.com/feed?fields=thumbnails,thumbnail,location,photos,user,store,renew_date,is_like,is_saved,category,link,object_highlight_specs,condition&functions=save,chat,like,apply_job,shipping,banner,highlight_ads%5Bobject_highlight_specs%5D&filter_version=4&meta=true&offset=${offset}&category=cars-and-vehicles&sortby&date&max_ad_price&min_ad_price&province&district&commune`,
    requestOptions,
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
const PAGE_SIZE = 30;
const main = async (timeActions = TIME_ACTIONS) => {
  for (let i = 0; i < timeActions; i++) {
    const data = await getPosts(i * PAGE_SIZE);
    const urls = [];
    const result = []
    data.forEach((item) => {
      if(item.type === 'post') {
        urls.push(item.data.link);
        result.push(item.data);
      }
    });
    
    console.log({ urls });
    console.log({ data: data[0] });
    console.log({ data: data[1] });
    // writeToFile(data);
  }
};

main(1);
