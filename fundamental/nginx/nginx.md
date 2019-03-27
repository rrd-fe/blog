### Nginx

### 安装nginx
https://www.nginx.com/resources/wiki/start/topics/tutorials/install/
```shell
# yum安装
vi /etc/yum.repos.d/nginx.repo

[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=0
enabled=1

yum install nginx / yum update nginx

nginx命令
nginx 		      # 打开nginx 默认配置文件 /etc/nginx/nginx.conf  通过-c 指定
nginx -s reload   # 重启
nginx -s stop     # 停止
nginx -t -c /etc/nginx/nginx.conf # 测试配置文件 

# 源码安装 https://nginx.org/en/download.html

# 修改防火墙
firewall-cmd --zone=public --permanent --add-service=http
firewall-cmd --zone=public --permanent --add-service=https
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --reload
firewall-cmd --list-all
```

### HTTPS
[SSL证书申请](https://cloud.tencent.com/document/product/400/6814)
[HTTPS证书安装](https://cloud.tencent.com/document/product/400/4143)


```shell
# 默认轮询
upstream nodejs {
    server 127.0.0.1:3000;
    server 127.0.0.1:4000;
}

server {
    listen 80;
    server_name www.bsky.ink;

    rewrite ^(.*)$  https://$host$1 permanent;
}

server {
    listen 443;
    server_name www.bsky.ink;
    ssl on;
    ssl_certificate /root/nginx_ssl/1_bsky.ink_bundle.crt;
    ssl_certificate_key /root/nginx_ssl/2_bsky.ink.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on;

    location ~ /(js|css|images) {
        root /opt/node/static/;
    }

    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forward-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Nginx-Proxy true;

	    proxy_pass http://nodejs;
    }
}

```

### Node环境
```shell
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
source ~/.bash_profile
nvm install 10.15.3
# pm2 start app.js   |   pm2 logs
```

参考资料: 
[Nginx Location 正则表达式](https://www.jianshu.com/p/9fd2ea5b7d12)
[Nginx 负载均衡策略](https://juejin.im/post/5adc240f51882567336a4f4b)