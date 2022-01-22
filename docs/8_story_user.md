# 8 Story: User Creationg and login

目标：通过 API 实现用户创建

需求：

-   支持测试

## Story: 创建用户

用户可以提交用户名和密码进行账号创建。

使用 POST 方法。

input 限制：

-   password 不能小于 8 个字符
-   userName 不能重复
-   userName 长度大于 4

密码需要使用 bcrypt 加密。

## Story：登录

登录成功后，会下发一个 jwttoken

## 测试数据库

使用一个 Docker 内的数据库。

参考：https://www.prisma.io/docs/guides/testing/integration-testing

## 代码

https://github.com/YuPototo/express_mongo_example/tree/b5511bddc5ce910e777bf33fc386f9a92327a337
