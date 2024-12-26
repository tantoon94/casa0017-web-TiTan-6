以下是常见的 `docker-compose` 指令及其作用，分为基础操作、调试与日志、扩展操作等部分。  

---

### **基础操作**

1. **启动服务**  
   启动 `docker-compose.yml` 中定义的所有服务：  
   ```bash
   docker-compose up
   ```
   - `-d`：以后台模式启动服务。  
     ```bash
     docker-compose up -d
     ```

2. **停止服务**  
   停止所有正在运行的容器，但不会删除容器：  
   ```bash
   docker-compose stop
   ```

3. **启动已停止的服务**  
   重新启动已经停止的容器：  
   ```bash
   docker-compose start
   ```

4. **关闭服务**  
   停止容器并删除容器、网络和挂载的卷：  
   ```bash
   docker-compose down
   ```
   - `-v`：删除容器关联的匿名卷。  

5. **重启服务**  
   停止并重新启动所有服务：  
   ```bash
   docker-compose restart
   ```

---

### **调试与日志**

6. **查看容器日志**  
   查看运行中的容器输出日志：  
   ```bash
   docker-compose logs
   ```
   - `-f`：实时查看日志流。  
     ```bash
     docker-compose logs -f
     ```
   - `服务名`：只查看特定服务的日志。  
     ```bash
     docker-compose logs phpmyadmin
     ```

7. **查看容器状态**  
   显示所有服务的运行状态：  
   ```bash
   docker-compose ps
   ```

---

### **管理与构建**

8. **构建镜像**  
   根据 `docker-compose.yml` 中的定义构建或重新构建服务：  
   ```bash
   docker-compose build
   ```
   - `--no-cache`：忽略缓存，强制重新构建。  
     ```bash
     docker-compose build --no-cache
     ```

9. **拉取镜像**  
   拉取服务所需的最新镜像：  
   ```bash
   docker-compose pull
   ```

10. **删除容器和卷**  
    删除所有容器和相关卷：  
    ```bash
    docker-compose rm
    ```
    - `-f`：强制删除，不会提示确认。  
      ```bash
      docker-compose rm -f
      ```

11. **查看配置信息**  
    验证 `docker-compose.yml` 文件格式是否正确并显示完整配置：  
    ```bash
    docker-compose config
    ```

---

### **扩展操作**

12. **列出卷**  
    查看 `docker-compose` 创建的所有卷：  
    ```bash
    docker volume ls
    ```

13. **查看网络**  
    查看 `docker-compose` 创建的所有网络：  
    ```bash
    docker network ls
    ```

14. **扩展服务**  
    按需增加服务实例的数量（水平扩展）：  
    ```bash
    docker-compose up --scale 服务名=实例数
    ```
    例如，将 `phpmyadmin` 服务扩展为 3 个实例：  
    ```bash
    docker-compose up --scale phpmyadmin=3
    ```

15. **指定文件运行**  
    使用非默认的 Compose 文件启动：  
    ```bash
    docker-compose -f docker-compose.prod.yml up
    ```

---

### **查看运行资源**

16. **检查容器使用的资源**  
    查看 CPU 和内存等资源使用情况：  
    ```bash
    docker stats
    ```

---

### **常见组合命令**

- **快速清理环境并重新运行**  
  停止、删除容器和卷并重新启动：  
  ```bash
  docker-compose down -v && docker-compose up -d
  ```

- **强制重建所有服务并启动**  
  ```bash
  docker-compose up --build -d
  ```

---

以上命令覆盖了 `docker-compose` 的绝大部分操作，基本可以满足日常开发和调试的需求。