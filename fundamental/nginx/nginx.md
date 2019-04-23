### Nginx

#### 安装Nginx
Nginx官方安装步骤: [https://www.nginx.com/resources/wiki/start/topics/tutorials/install/](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/) 

> 使用yum来安装

首先创建在终端下执行如下命令来创建nginx repo: `vi /etc/yum.repos.d/nginx.repo`，内容如下：

```shell
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=0
enabled=1
```
保存并退出后依次执行`yum update nginx` 和 `yum install nginx`来安装nginx。


nginx命令
nginx 		      # 打开nginx 默认配置文件 /etc/nginx/nginx.conf  通过-c 指定
nginx -s reload   # 重启
nginx -s stop     # 停止
nginx -t -c /etc/nginx/nginx.conf # 测试配置文件 

> 源码安装 

源码安装的方式可以指定nginx的模块，自定义nginx的配置项，详情参考[官方文档](https://nginx.org/en/download.html)。

#### 修改防火墙
安装完Nginx后，需要把80和443端口打开，在CentOS7的firewalld中这两个端口是默认关闭的。

```shell
firewall-cmd --zone=public --permanent --add-service=http   # 使防火墙命令允许http协议数据包
firewall-cmd --zone=public --permanent --add-service=https
firewall-cmd --zone=public --add-port=80/tcp --permanent    # 开放80端口
firewall-cmd --reload                                       # 重载防火墙
firewall-cmd --list-all                                     # 列出所有防火墙规则
```


### HTTPS
HTTPS证书是专业安全机构签发的，需要自己去申请，详细申请以及安装步骤请参考腾讯云[SSL证书申请](https://cloud.tencent.com/document/product/400/6814)，和[HTTPS证书安装](https://cloud.tencent.com/document/product/400/4143)。

默认nginx的配置文件在/etc/nginx/nginx.conf下，我们需要添加关于nginx转发的一些配置:


**1) 添加上游服务器，把除静态资源外的请求的转发到后端，可以是PHP、Python等等，这里我使用NodeJS作为后端。**
```shell 
# 默认轮询的负载均衡规则
upstream nodejs {
    server 127.0.0.1:3000;
    server 127.0.0.1:4000;
}
```

**2) 将http的请求重定向到https协议**
```shell
server {
    listen 80;
    server_name www.bsky.ink;

    rewrite ^(.*)$  https://$host$1 permanent;
}
```

##3) 监听443端口并设置证书和转发规则**
```shell
server {
    listen 443;
    server_name www.bsky.ink;
    ssl on;
    # 设置证书.crt和.key文件的路径
    ssl_certificate /root/nginx_ssl/1_bsky.ink_bundle.crt;
    ssl_certificate_key /root/nginx_ssl/2_bsky.ink.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on;

    # 匹配静态资源, 由nginx自身处理
    location ~ /(js|css|images) {
        root /opt/node/static/;
    }

    # 静态资源外的所有请求都转发给后端服务
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forward-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Nginx-Proxy true;

	    proxy_pass http://nodejs;
    }
}
```

> 以下是所有的配置项
```shell
# 默认轮询的负载均衡规则
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
     # 设置证书.crt和.key文件的路径
    ssl_certificate /root/nginx_ssl/1_bsky.ink_bundle.crt;
    ssl_certificate_key /root/nginx_ssl/2_bsky.ink.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on;

    # 匹配静态资源, 由nginx自身处理
    location ~ /(js|css|images) {
        root /opt/node/static/;
    }

    # 静态资源外的所有请求都转发给后端服务
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forward-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Nginx-Proxy true;

	    proxy_pass http://nodejs;
    }
}

```

此时nginx会把静态资源外的所有请求转发到后端两个服务上, 由默认规则进行负载均衡。并且当访问 http://example.com 时，会重定向到 https://example.com。

参考资料: 
[Nginx Location 正则表达式](https://www.jianshu.com/p/9fd2ea5b7d12)
[Nginx 负载均衡策略](https://juejin.im/post/5adc240f51882567336a4f4b)