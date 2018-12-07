'use static';

const { json, send } = require('micro');
const { parse } = require('url');
const storage = require('node-persist');

const redirect = async(res, url) => {
    res.statusCode = 301;
    res.setHeader('Location', await url);
    res.end();
}

const post = async(req, res) => {
    const {url, alias } = await json(req);    
    if (await read(alias)) {
        send(res, 400, 'alias already exists');
        handle
    };

    try {
        await write(url, alias);
    } catch(e) {
        return send(res, 500, 'internal error');
    }

    return({url});
};

const read = async(key) => {
    try {
        await storage.init();
        const { url } = await storage.getItem(key)
        return url;
    } catch(e) {
        return false;
    }
}

const write = async(url, alias) => {
    await storage.init();
    return await storage.setItem(alias, {
        'url': url
    });
}

const get = async (req, res) => {
    parsedReq = parse(req.url, true);
    const alias = parsedReq.pathname.slice(1);
    const url = await read(alias);

    if (!url) return send(res, 404, 'not found');
    if (parsedReq.query.noRedirect) return url;
    return redirect(res, url)
};

module.exports = async (req, res) => {
    try {
        switch (req.method) {
        case 'POST':
          return await post(req, res);
        case 'GET':
          return await get(req, res);
        default:
          send(res, 405, 'Invalid method');
          break;
        }
      } catch (error) {
        throw error;
      }
  }
