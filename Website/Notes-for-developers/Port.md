# Operation of the port
## **What should I do if "listen tcp4 0.0.0.0:3306: bind: address already in use"**

The error `listen tcp4 0.0.0.0:3306: bind: address already in use` means another process or service is already using port `3306`, which is MySQL's default port. As a result, your MySQL container cannot bind to it.

### **Steps to Resolve**

---

#### **1. Identify What Is Using Port 3306**
Run the following command to check which process is using port `3306`:
```bash
sudo lsof -i:3306
```

Example output:
```bash
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
mysqld    1234  mysql   12u  IPv4 123456      0t0  TCP *:3306 (LISTEN)
```

If the output shows `mysqld` or a similar MySQL service, it means a local MySQL service is already running on the host machine.

---

#### **2. Stop the Local MySQL Service**
If you don’t need the system’s MySQL service and only want to use Docker’s MySQL, stop the local service.

Stop the service:
```bash
sudo systemctl stop mysql
```

(Optional) Disable it from starting at boot:
```bash
sudo systemctl disable mysql
```

Verify that the service is stopped:
```bash
sudo systemctl status mysql
```

---

#### **3. Change the Port Mapping for the Docker MySQL Container**
If you want to keep the local MySQL service running, or if another container is already using port `3306`, you can map the Docker container to a different port (e.g., `3307`).

Update your `docker-compose.yml` or Docker command. For example:
```yaml
services:
  db:
    image: mysql:8
    ports:
      - "3307:3306"  # Map port 3306 inside the container to port 3307 on the host
```

Start the container and connect to it using the new port:
```bash
mysql -h 127.0.0.1 -P 3307 -u root -p
```

---

#### **4. Check for Running Docker Containers**
If this error occurs because multiple instances of the same MySQL container are running, stop and remove duplicate containers.

List all running containers:
```bash
sudo docker ps
```

If you find duplicate MySQL containers, stop and remove them:
```bash
sudo docker stop <container_id>
sudo docker rm <container_id>
```

---

#### **5. Restart Your Docker Container**
After making changes, restart your MySQL container:
```bash
sudo docker-compose up -d
```

Verify that it is running correctly:
```bash
sudo docker ps
```

---

### **Summary**
- Use `lsof` to check what is using port `3306`.
- Stop the local MySQL service if you don’t need it, or change the Docker port mapping to avoid conflicts.
- Ensure no duplicate containers are running.
- Restart your Docker container and verify functionality.