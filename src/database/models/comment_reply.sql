CREATE TABLE IF NOT EXISTS `comments_reply` (
  `comments_id` int(11) NOT NULL,
  `replay_id` int(11) NOT NULL,
  `articles_aid` varchar(50) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`comments_id`,`replay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;