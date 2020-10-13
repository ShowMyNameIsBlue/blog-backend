CREATE TABLE IF NOT EXISTS `articles_tag` (
  `articles_id` int(11) NOT NULL,
  `tag_name` VARCHAR(20) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`articles_id`,`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;