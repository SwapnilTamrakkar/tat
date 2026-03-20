const fs = require('fs');
const glob = require('child_process');
const q = String.fromCharCode(39);
const d = \"../../../\";
const files = glob.execSync('dir /s /b src\\\\components\\\\features\\\\*.tsx', {encoding: 'utf8'}).split('\\r\\n').filter(Boolean);
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.split(\"from '../../\").join(\"from '\" + d);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
}
