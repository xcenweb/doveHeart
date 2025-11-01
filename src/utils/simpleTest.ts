import { toolService } from './toolService';

// 测试用例
console.log('测试 {"think" 这种格式:');
const result1 = toolService.parse('{"think"');
console.log(JSON.stringify(result1, null, 2));

console.log('\n测试 {"think": 这种格式:');
const result2 = toolService.parse('{"think":');
console.log(JSON.stringify(result2, null, 2));