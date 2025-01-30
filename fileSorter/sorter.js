const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const dirPath = "C:\\Users\\u_011\\Downloads";

// 파일 분류
async function sortFiles(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const fileName of files) {
    if (fileName === 'desktop.ini') continue;

    const filePath = path.join(dirPath, fileName);
    const newPath = path.join(await createDirectory(filePath), fileName);

    console.log(`${filePath} -> ${newPath}`);
    fs.renameSync(filePath, newPath);
  }
}

// 해당 파일의 상위 폴더 생성
async function createDirectory(filePath) {
  const projectName = getProjectName(path.basename(filePath));
  const fileDate = await getFileDate(filePath);
  const newPath = path.join("C:\\유미\\다운로드", projectName, fileDate.substring(0, 4), fileDate);

  fs.mkdirSync(newPath, { recursive: true });
  return newPath;
}

// 프로젝트 패턴 정의 후 일치하는 프로젝트명 반환
function getProjectName(fileName) {
  const pattern = /WMS|RMS|업무일지|MES|SFM/i;
  const match = fileName.match(pattern);

  return match ? match[0].toUpperCase() : "etc";
}

// 파일 날짜 확인
async function getFileDate(filePath) {
  const stats = fs.statSync(filePath);
  return format(stats.mtime, "yyMMdd");
}

// 실행
sortFiles(dirPath).catch(console.error);