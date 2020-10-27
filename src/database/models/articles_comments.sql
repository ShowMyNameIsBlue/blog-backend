CREATE TABLE IF NOT EXISTS `articles_comments` (
  `articles_aid` varchar(50) NOT NULL,
  `comments_id` int(11) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`articles_aid`,`comments_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;