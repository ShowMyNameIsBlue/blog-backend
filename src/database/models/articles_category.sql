CREATE TABLE IF NOT EXISTS `articles_category` (
  `articles_id` int(11) NOT NULL,
  `category_name` VARCHAR(20) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`articles_id`,`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;