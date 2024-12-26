# 增加数据库的步骤
要在你的后端项目中增加数据库，可以通过以下步骤完成。在你的环境中，推荐使用 Docker Compose 来管理数据库服务与后端服务的集成。
### 1. 选择数据库
最常用的数据库包括：
- **MySQL**：流行的关系型数据库，适合结构化数据。
- **PostgreSQL**：功能强大的关系型数据库，支持高级特性。
- **MongoDB**：文档型数据库，适合非结构化数据。

下面以 **MySQL** 为例，说明如何增加数据库到你的项目中。

---

### 2. 修改 `docker-compose.yml` 文件
在 `docker-compose.yml` 文件中，增加一个 MySQL 服务：

```yaml
services:
  backend:
    build:
      context: ./backend
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=rootpassword
      - DB_NAME=mydatabase
    depends_on:
      - mysql
    restart: always

  mysql:
    image: mysql:8.0
    container_name: mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mydatabase
    volumes:
      - mysql_data:/var/lib/mysql
    restart: always

volumes:
  mysql_data:
```

---

### 3. 配置后端连接数据库

#### （1）安装数据库依赖
在后端服务中安装与数据库相关的依赖包（例如 `mysql2`）：
- 更新你的 `package.json`：
  ```bash
  npm install mysql2
  ```
- 确保 `package.json` 中有以下内容：
  ```json
  "dependencies": {
    "mysql2": "^3.2.0"
  }
  ```

#### （2）更新后端代码

在后端项目的 `server.js` 中，添加数据库连接代码：

```javascript
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 4000;

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'mydatabase',
};

let connection;

// 创建数据库连接
const connectToDatabase = async () => {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the MySQL database.');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
};

app.get('/', async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Database connected!', result: rows[0].result });
  } catch (err) {
    console.error('Query failed:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Backend is running on http://localhost:${PORT}`);
});
```

---

### 4. 重新构建和启动项目

1. 停止当前运行的容器：
   ```bash
   docker-compose down
   ```

2. 重新构建和启动容器：
   ```bash
   docker-compose up --build
   ```

3. 查看服务是否正常运行：
   - 数据库服务通过 `3306` 端口暴露，可以使用数据库管理工具（如 DBeaver、phpMyAdmin）连接测试。
   - 后端服务应能够通过访问 `http://localhost:4000` 返回测试结果。

---

### 5. 验证数据库连接

通过以下步骤验证数据库集成是否成功：

- 在浏览器或 Postman 中访问 `http://localhost:4000`，应该返回 JSON 响应，类似以下内容：
  ```json
  {
    "message": "Database connected!",
    "result": 2
  }
  ```
- 如果出现数据库连接错误，请检查：
  1. 数据库服务是否正常启动（`docker ps` 查看容器状态）。
  2. 后端的环境变量是否正确配置。

---

### 6. 数据库管理（可选）

如果需要更方便地管理数据库，可以增加 `phpMyAdmin`：
在 `docker-compose.yml` 中增加以下服务：
```yaml
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_USER: root
      PMA_PASSWORD: rootpassword
    ports:
      - "8080:80"
    depends_on:
      - mysql
```

启动后，访问 `http://localhost:8080` 使用图形界面管理数据库。

---
# mysql  初始化

在 `mysql` 文件夹中放置的文件和内容，主要用于初始化 MySQL 数据库，例如创建数据库、表结构和填充初始数据。MySQL 容器启动时会自动执行这些文件。


### 1. 初始化文件放置位置
你需要在 `mysql` 文件夹中创建一个子文件夹，通常命名为 `init` 或 `initdb.d`，并在其中放置 `.sql` 或 `.sh` 文件。

假设你的项目结构如下：

```
project/
├── backend/
├── docker-compose.yml
├── mysql/
│   ├── init/
│   │   ├── init.sql
│   │   └── seed.sql
```

在 `docker-compose.yml` 中需要映射 `mysql/init` 目录到容器内的 `/docker-entrypoint-initdb.d/`：

```yaml
  mysql:
    image: mysql:8.0
    container_name: mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mydatabase
    volumes:
      - ./mysql/init:/docker-entrypoint-initdb.d
    restart: always
```

---

### 2. 必需文件

#### （1）`init.sql` - 数据库初始化脚本
用于创建表和基础结构的 SQL 文件：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### （2）`seed.sql` - 数据填充脚本
用于插入一些初始测试数据：

```sql
-- 插入测试用户
INSERT INTO users (username, password, email) VALUES
('user1', 'password1', 'user1@example.com'),
('user2', 'password2', 'user2@example.com');

-- 插入测试产品
INSERT INTO products (name, description, price) VALUES
('Product A', 'Description for product A', 10.50),
('Product B', 'Description for product B', 20.00);
```

MySQL 容器启动时，会自动加载这些 `.sql` 文件，并执行其中的 SQL 命令。

---

### 3. 可选文件

#### （1）`init.sh` - 初始化脚本（用于更复杂的初始化）
如果需要额外的 Bash 脚本操作，可以创建一个 `.sh` 文件，例如：

```bash
#!/bin/bash
echo "Running custom initialization script..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" mydatabase < /docker-entrypoint-initdb.d/custom_script.sql
```

- 将其命名为 `init.sh`。
- 确保文件以可执行权限挂载（如 `chmod +x init.sh`）。

#### （2）配置文件
如果需要自定义 MySQL 的配置（如字符集或时区设置），可以创建 `my.cnf` 文件，并在 `docker-compose.yml` 中挂载到 `/etc/mysql/my.cnf`：

```yaml
volumes:
  - ./mysql/config/my.cnf:/etc/mysql/my.cnf
```

示例配置文件 `mysql/config/my.cnf`：
```ini
[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default-time-zone = '+00:00'
```

---

### 4. 测试初始化是否成功
1. 启动容器：
   ```bash
   docker-compose up --build
   ```
2. 检查 MySQL 容器日志，确保初始化脚本执行成功：
   ```bash
   docker logs mysql
   ```
   日志中应看到 `Executing /docker-entrypoint-initdb.d/init.sql` 等信息。
3. 使用 MySQL 客户端或工具连接数据库，验证表和数据是否已经初始化。

---

通过这种方式，你可以在 MySQL 容器启动时，自动完成表结构和初始数据的创建。需要更复杂的操作时，也可以扩展初始化脚本的逻辑。


# 要判断 MySQL 数据库是否链接成功，可以尝试以下方法：

---

### 方法 1：通过 `docker logs` 查看日志输出
从你提供的日志中，可以看到以下关键信息：

1. **创建数据库完成：**
   ```
   2024-12-26 11:39:16+00:00 [Note] [Entrypoint]: Creating database mydatabase
   ```

2. **运行初始化脚本成功：**
   ```
   2024-12-26 11:39:17+00:00 [Note] [Entrypoint]: /docker-entrypoint-initdb.d/init.sql
   2024-12-26 11:39:17+00:00 [Note] [Entrypoint]: /docker-entrypoint-initdb.d/seed.sql
   ```

3. **MySQL 启动完成：**
   ```
   2024-12-26T11:39:20.859787Z 0 [System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.40'  socket: '/var/run/mysqld/mysqld.sock'  port: 3306  MySQL Community Server - GPL.
   ```

日志最后一行 `ready for connections` 表明 MySQL 已经启动并可以接受连接。

---

### 方法 2：通过 `docker exec` 进入容器内部测试

运行以下命令进入 MySQL 容器：
```bash
docker exec -it mysql_container_name bash
```

然后使用 `mysql` 命令连接数据库：
```bash
mysql -u root -p
```

输入你在 `docker-compose.yml` 中设置的 `MYSQL_ROOT_PASSWORD`。

成功登录后，可以运行以下命令检查是否创建了你的数据库：
```sql
SHOW DATABASES;
```

你应该能够看到类似以下输出：
```
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mydatabase         |
+--------------------+
```

---

### 方法 3：从宿主机或其他容器连接 MySQL

如果你在 `docker-compose.yml` 中暴露了 MySQL 的 3306 端口，使用以下命令测试连接：
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
```

输入 `MYSQL_ROOT_PASSWORD`。登录后，同样可以使用 `SHOW DATABASES;` 验证。

---

### 方法 4：通过 MySQL Workbench 或其他客户端工具测试

1. 打开 **MySQL Workbench** 或类似工具。
2. 创建一个新的连接，输入以下信息：
   - **Host**: `localhost`（如果是本地）或 Docker 容器的 IP 地址。
   - **Port**: `3306`
   - **Username**: `root` 或配置的用户名。
   - **Password**: 配置的密码。
3. 测试连接，检查是否可以成功登录。

---

### 方法 5：通过应用程序测试连接

在后端代码中（例如 Node.js 的 `server.js`），你可以尝试连接数据库：
```javascript
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost', // 或 docker-compose 指定的服务名
  user: 'root',
  password: 'your_root_password',
  database: 'mydatabase',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the MySQL database!');
  }
});
```

启动后，如果输出 `Connected to the MySQL database!`，则说明连接成功。

---

### 总结

#### 判断标准：
1. 日志中出现 `ready for connections`。
2. 使用 `docker exec` 登录容器并执行 SQL 查询成功。
3. 宿主机或远程客户端工具可以连接。
4. 应用程序可以成功连接并进行操作。

只要满足任意一种方法的成功条件，就说明 MySQL 数据库运行正常，连接成功！

# Other notes

## 避免直接访问数据库端口

访问 http://localhost:3306 不会有意义，因为 MySQL 是一个数据库服务，没有 HTTP Web 服务接口。如果需要 HTTP 界面，建议使用像 phpMyAdmin 这样的工具。

如果你只是看到乱码，不需要担心数据库的运行状态。这是正常现象，表示 MySQL 服务在 3306 端口已启动并在等待数据库连接请求。