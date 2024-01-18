CREATE TABLE IF NOT EXISTS `AHA_USER` (
  `uid` varchar(128) NOT NULL,
  `email` varchar(256) NOT NULL,
  `displayName` varchar(128) NOT NULL,
  `hashedPassword` varchar(256) NOT NULL,
  `createdDatetime` bigint(20) NOT NULL,
  `emailActivated` BOOLEAN NOT NULL,
  `loginCount` int(11) NOT NULL,
  `disabled` BOOLEAN NOT NULL,
  `lastAccessDatetime` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `UK_EMAIL` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


CREATE TABLE IF NOT EXISTS `AHA_AUTH_SESSION` (
  `uid` varchar(128) NOT NULL,
  `userUid` varchar(128) NOT NULL,
  `token` varchar(256) NOT NULL,
  `createdDatetime` bigint(20) NOT NULL,
  `lastAccessDatetime` bigint(20) DEFAULT NULL,
  `invalid` BOOLEAN NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `UK_TOKEN` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


CREATE TABLE IF NOT EXISTS `AHA_EMAIL_ACTIVATION` (
  `uid` varchar(128) NOT NULL,
  `userUid` varchar(128) NOT NULL,
  `token` varchar(256) NOT NULL,
  `createdDatetime` bigint(20) NOT NULL,
  `activatedDatetime` bigint(20) DEFAULT NULL,

  PRIMARY KEY (`uid`),
  UNIQUE KEY `UK_TOKEN` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


ALTER TABLE AHA_AUTH_SESSION ADD CONSTRAINT `FK_USERUID_AUTHSESSION2USER` FOREIGN KEY IF NOT EXISTS (`userUid`) REFERENCES `AHA_USER` (`uid`);
ALTER TABLE AHA_EMAIL_ACTIVATION ADD CONSTRAINT `FK_USERUID_EMAILACTIVATION2USER` FOREIGN KEY IF NOT EXISTS (`userUid`) REFERENCES `AHA_USER` (`uid`);

