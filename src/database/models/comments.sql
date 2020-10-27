CREATE TABLE IF NOT EXISTS  `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitor` varchar(50) NOT NULL,
  `mail` varchar(100),
  `url` varchar(100),
  `content` text NOT NULL, /* 唯一的身份标识，暂时未定 */
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;