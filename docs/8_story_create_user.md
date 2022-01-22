# 8 Story: Create User

目标：通过 API 实现用户创建

需求：

-   支持测试

## Story

用户可以提交用户名和密码进行账号创建。

使用 POST 方法。

input 限制：

-   password 不能小于 8 个字符
-   userName 不能重复
-   userName 长度大于 4

密码需要使用 bcrypt 加密。

## 测试数据库

使用一个 Docker 内的数据库。

参考：https://www.prisma.io/docs/guides/testing/integration-testing
