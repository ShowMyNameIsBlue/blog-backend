CREATE TABLE IF NOT EXISTS  `images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imgPath` VARCHAR(100) NOT NULL,
  `articles_aid` varchar(50) NOT NULL,
  `imgOrder` int(11) UNIQUE NOT NULL, /*图片在文章出现的顺序 从1开始，从上到下，从左到右*/
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;