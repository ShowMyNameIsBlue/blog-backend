CREATE TABLE IF NOT EXISTS  `articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `aid` int(11) NOT NUll,
  `title` varchar(128) NOT NUll,
  `content` text NOT NULL,
  `features` JSON NOT NUll,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `aid` (`aid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;