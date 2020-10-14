CREATE TABLE IF NOT EXISTS `articles_category` (
  `articles_aid` varchar(50) NOT NULL,
  `category_name` VARCHAR(20) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`articles_aid`,`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;