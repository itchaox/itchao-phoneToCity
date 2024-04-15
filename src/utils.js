// 使用动态导入，以在浏览器环境中避免加载 node:fs 和 node:path 模块
const isNode = typeof window === 'undefined';
let fs, path, find;

const fetchData = async (filePath) => {
  if (isNode) {
    // 在 Node.js 环境中使用 fs.readFileSync
    return fs.readFileSync(path.join(__dirname, filePath));
  } else {
    // 在浏览器中使用 fetch 获取文件数据
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
};

const formatResult = (phone, opType, content) => {
  const opMap = [
    '异常',
    '移动', // 1
    '联通', // 2
    '电信', // 3
    '电信虚拟运营商', // 4
    '联通虚拟运营商', // 5
    '移动虚拟运营商', // 6
  ];
  const arr = (content || '||||').split('|');
  const areaCode = arr[3].replace(/\D/g, ''); // 仅提取数字部分
  return {
    phone,
    op: opMap[opType],
    province: arr[0],
    city: arr[1],
    zipCode: arr[2],
    areaCode,
  };
};

const foo = async () => {
  if (isNode) {
    fs = require('fs');
    path = require('path');
  }

  // 获取 phone.dat 数据
  const buf = await fetchData('phone.dat');
  const indexOffset = new DataView(buf.buffer).getInt32(4, true);
  const size = (buf.length - indexOffset) / 9;

  // 创建用于解码 UTF-8 数据的 TextDecoder 实例
  const textDecoder = new TextDecoder('utf-8');

  find = (phoneOrigin) => {
    const phone = parseInt(`${phoneOrigin}`.substr(0, 7));
    let left = 0;
    let right = size - 1;

    while (left <= right) {
      const pos = ((right + left) / 2) | 0;
      const index = new DataView(buf.buffer).getInt32(indexOffset + pos * 9, true);

      if (index < phone) {
        if (left === pos) {
          return formatResult(phoneOrigin, 0, null);
        }
        left = pos;
      } else if (index > phone) {
        if (right === pos) {
          return formatResult(phoneOrigin, 0, null);
        }
        right = pos;
      } else {
        // 匹配
        const infoOffset = new DataView(buf.buffer).getInt32(indexOffset + pos * 9 + 4, true);
        const phoneType = new DataView(buf.buffer).getInt8(indexOffset + pos * 9 + 8);
        const content = buf.slice(infoOffset, infoOffset + 100);
        const contentString = textDecoder.decode(content).split('\n')[0];
        return formatResult(phoneOrigin, phoneType, contentString);
      }
    }
  };
};

// 立即执行 foo 函数并等待其完成
(async () => {
  await foo();
})();

export { find };
