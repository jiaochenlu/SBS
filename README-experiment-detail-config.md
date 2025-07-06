# 实验详情页配置文件改造说明

## 改造目标

将实验详情页面的硬编码配置信息改为从JSON配置文件动态加载，为将来扩展为后端接口奠定基础。

## 改造内容

### 1. 新增配置文件

创建了 `experiment-detail-config.json` 文件，包含完整的实验配置信息：

- **基本信息**: 实验名称、描述、状态、创建时间、负责人
- **进度数据**: 总查询数、完成数、进行中、未开始的统计信息
- **配置详情**: 实验类型、数据模式、数据源、查询设置等
- **团队成员**: 所有参与实验的成员信息
- **查询数据**: 所有查询及其分配情况
- **判断问题**: 实验中的评判标准和问题设置
- **结果统计**: 实验的质量指标和完成情况

### 2. 修改的文件

#### experiment-detail.html
- 将硬编码的文本内容替换为动态ID标识符
- 添加了用于动态更新的HTML元素ID
- 保持原有的页面结构和样式

#### experiment-detail.js
- 新增了 `loadExperimentConfig()` 函数用于加载配置文件
- 新增了 `updateUIWithConfigData()` 函数用于更新界面
- 修改了 `loadQueries()` 和 `loadMembers()` 函数使其从配置数据读取
- 在页面初始化时优先加载配置文件
- 添加了错误处理和回退机制

### 3. 新增测试页面

创建了 `test-experiment-detail.html` 测试页面，用于验证配置文件加载功能。

## 配置文件结构

```json
{
  "version": "1.0",
  "description": "Experiment detail configuration for SBS platform",
  "experiment": {
    "id": "search-ndcg-001",
    "name": "Search NDCG Experiment",
    "status": "active",
    "createdAt": "March 15, 2024",
    "owner": { ... },
    "configuration": { ... },
    "progress": { ... },
    "members": [ ... ],
    "queries": [ ... ],
    "results": { ... }
  }
}
```

## 使用方法

### 1. 启动本地服务器

```bash
npx http-server -p 8000
```

### 2. 访问页面

- 主实验详情页: `http://localhost:8000/experiment-detail.html`
- 配置测试页面: `http://localhost:8000/test-experiment-detail.html`

### 3. 修改配置

直接编辑 `experiment-detail-config.json` 文件，刷新页面即可看到更新后的内容。

## 功能特点

### 1. 动态加载
- 页面启动时自动从JSON文件加载配置
- 支持异步加载，不阻塞页面渲染
- 加载失败时有友好的错误提示

### 2. 容错机制
- 配置文件加载失败时回退到默认数据
- 保持页面功能的完整性
- 详细的错误日志输出

### 3. 向后兼容
- 保持原有的页面功能和交互
- 不影响现有的用户权限和角色管理
- 数据结构与原硬编码保持一致

### 4. 易于扩展
- 配置文件结构清晰，便于后续扩展
- 为后端API接口预留了接口
- 支持版本控制和配置验证

## 扩展为后端接口

当需要连接后端时，只需要修改 `loadExperimentConfig()` 函数中的数据源：

```javascript
// 将来可以改为从API获取数据
const response = await fetch('/api/experiments/{id}/config');
```

## 文件清单

- `experiment-detail-config.json` - 实验配置文件
- `experiment-detail.html` - 修改后的主页面
- `experiment-detail.js` - 修改后的脚本文件
- `test-experiment-detail.html` - 配置测试页面
- `README-experiment-detail-config.md` - 本说明文档

## 验证步骤

1. 打开 `http://localhost:8000/test-experiment-detail.html` 验证配置加载
2. 打开 `http://localhost:8000/experiment-detail.html` 验证主页面功能
3. 修改 `experiment-detail-config.json` 中的数据，刷新页面验证动态更新
4. 检查浏览器控制台确认没有加载错误

## 注意事项

- 确保JSON文件格式正确，语法错误会导致加载失败
- 服务器需要支持JSON文件的MIME类型
- 跨域访问时需要适当的CORS设置
- 配置文件中的数据结构需要与JavaScript代码保持一致

这次改造为实验详情页面的配置管理提供了更好的灵活性和可维护性，为后续的功能扩展奠定了良好的基础。