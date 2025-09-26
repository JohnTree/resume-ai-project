# Android支付接入完整指南

## 📋 准备工作清单

### 1. 微信支付接入准备

#### 🔸 申请微信开放平台账号
1. 访问：https://open.weixin.qq.com/
2. 注册开发者账号（需要300元认证费）
3. 创建移动应用
4. 填写应用信息：
   - 应用名称：ResumeAI
   - 应用简介：AI智能简历制作工具
   - 应用官网：你的官网地址
   - 应用包名：com.resumeai.app（需要与你的应用包名一致）

#### 🔸 申请微信商户平台
1. 访问：https://pay.weixin.qq.com/
2. 注册商户账号
3. 提交资质材料：
   - 营业执照（个体工商户或企业）
   - 法人身份证
   - 银行开户许可证
   - 经营场所照片

#### 🔸 获取微信支付参数
完成申请后，你将获得：
```javascript
const WECHAT_CONFIG = {
  appId: 'wxXXXXXXXXXXXXXXXX',        // 微信开放平台AppID
  appSecret: 'XXXXXXXXXXXXXXXX',       // 应用密钥
  mchId: '1234567890',                 // 商户号
  apiKey: 'XXXXXXXXXXXXXXXX',          // API密钥（32位）
  notifyUrl: 'https://your-domain.com/api/wechat/notify'  // 支付回调地址
};
```

### 2. 支付宝接入准备

#### 🔸 申请支付宝开放平台账号
1. 访问：https://open.alipay.com/
2. 注册开发者账号
3. 创建应用：
   - 应用类型：移动应用
   - 应用名称：ResumeAI
   - 应用包名：com.resumeai.app

#### 🔸 生成RSA密钥对
1. 下载支付宝密钥生成工具
2. 生成2048位RSA密钥对
3. 上传公钥到支付宝开放平台
4. 下载支付宝公钥

#### 🔸 获取支付宝参数
```javascript
const ALIPAY_CONFIG = {
  appId: '2021XXXXXXXXXX',             // 支付宝AppID
  privateKey: 'MIIEvgIBADANBg...',     // 应用私钥（完整的）
  alipayPublicKey: 'MIIBIjANBg...',    // 支付宝公钥
  notifyUrl: 'https://your-domain.com/api/alipay/notify'  // 支付回调地址
};
```

## 🛠️ 技术实现步骤

### 第一步：安装必要的依赖包

```bash
# 进入项目目录
cd ResumeAI

# 安装微信支付SDK
npm install react-native-wechat-lib

# 安装支付宝SDK
npm install @uiw/react-native-alipay

# 如果使用Expo，需要创建开发构建
npx expo install expo-dev-client
```

### 第二步：配置Android原生代码

#### 🔸 微信支付配置
1. 在 `android/app/src/main/java/com/resumeai/MainApplication.java` 中添加：
```java
import com.theweflex.react.WeChatPackage;

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new WeChatPackage()  // 添加这行
    );
}
```

2. 在 `android/app/src/main/AndroidManifest.xml` 中添加：
```xml
<activity
    android:name=".wxapi.WXPayEntryActivity"
    android:exported="true"
    android:launchMode="singleTop">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:scheme="你的微信AppID" />
    </intent-filter>
</activity>
```

#### 🔸 支付宝配置
在 `android/app/src/main/AndroidManifest.xml` 中添加：
```xml
<activity
    android:name="com.alipay.sdk.app.H5PayActivity"
    android:configChanges="orientation|keyboardHidden|navigation|screenSize"
    android:exported="false"
    android:screenOrientation="behind"
    android:windowSoftInputMode="adjustResize|stateHidden" />
```

### 第三步：后端API开发

你需要创建以下后端接口：

#### 🔸 微信支付统一下单接口
```javascript
// POST /api/payment/wechat/create
{
  "planType": "monthly",
  "paymentMethod": "wechat",
  "platform": "android"
}

// 返回数据
{
  "success": true,
  "data": {
    "appId": "wxXXXXXXXX",
    "partnerId": "1234567890",
    "prepayId": "wx202409241300001",
    "packageValue": "Sign=WXPay",
    "nonceStr": "abc123def456",
    "timeStamp": "1695542400",
    "sign": "生成的签名"
  }
}
```

#### 🔸 支付宝统一下单接口
```javascript
// POST /api/payment/alipay/create
{
  "planType": "monthly", 
  "paymentMethod": "alipay",
  "platform": "android"
}

// 返回数据
{
  "success": true,
  "data": {
    "orderInfo": "完整的支付参数字符串"
  }
}
```

#### 🔸 支付结果验证接口
```javascript
// POST /api/payment/wechat/verify
// POST /api/payment/alipay/verify
{
  "transactionId": "支付流水号"
}
```

### 第四步：签名算法实现

#### 🔸 微信支付签名（后端实现）
```javascript
const crypto = require('crypto');

function generateWeChatSign(params, apiKey) {
  // 1. 参数排序
  const sortedParams = Object.keys(params)
    .filter(key => params[key] !== '' && key !== 'sign')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // 2. 拼接API密钥
  const stringSignTemp = `${sortedParams}&key=${apiKey}`;
  
  // 3. MD5加密并转大写
  return crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
}
```

#### 🔸 支付宝签名（后端实现）
```javascript
const crypto = require('crypto');

function generateAlipaySign(params, privateKey) {
  // 1. 参数排序
  const sortedParams = Object.keys(params)
    .filter(key => params[key] !== '' && key !== 'sign')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // 2. RSA2签名
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sortedParams, 'utf8');
  return sign.sign(privateKey, 'base64');
}
```

## 🔧 开发环境配置

### 方案一：使用Expo开发构建
```bash
# 安装Expo CLI
npm install -g @expo/cli

# 创建开发构建
npx expo install expo-dev-client

# 构建开发版本
eas build --profile development --platform android
```

### 方案二：弹出到裸React Native
```bash
# 弹出Expo项目
npx expo eject

# 运行Android
npx react-native run-android
```

## 📱 测试流程

### 1. 沙盒环境测试
- 微信支付：使用微信支付沙盒环境
- 支付宝：使用支付宝沙盒环境

### 2. 真机测试
- 安装测试APK到Android设备
- 确保设备安装了微信和支付宝APP
- 使用小额订单进行测试

### 3. 生产环境上线
- 完成商户资质审核
- 配置正式环境参数
- 发布到应用商店

## ⚠️ 注意事项

1. **安全性**：
   - 所有签名算法必须在后端实现
   - 不要在前端暴露API密钥和私钥
   - 使用HTTPS传输敏感数据

2. **合规性**：
   - 确保有合法的营业资质
   - 遵守支付平台的服务协议
   - 实现必要的风控措施

3. **用户体验**：
   - 提供清晰的支付流程指引
   - 处理支付失败的各种情况
   - 实现支付状态的实时反馈

## 🚀 下一步行动

1. **立即开始**：申请微信开放平台和支付宝开放平台账号
2. **准备资料**：整理营业执照等必要文件
3. **搭建后端**：实现支付相关的API接口
4. **集成测试**：在开发环境中测试支付流程
5. **发布上线**：完成审核后发布到应用商店

需要我帮你实现具体的某个步骤吗？