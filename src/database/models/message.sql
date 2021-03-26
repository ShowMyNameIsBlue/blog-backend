CREATE TABLE IF NOT EXISTS `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mid` varchar(50) NOT NULL,
  `messager` varchar(50) NOT NULL,
  `mail` varchar(100),
  `url` varchar(100),
  `content` text NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `mid` (`mid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;