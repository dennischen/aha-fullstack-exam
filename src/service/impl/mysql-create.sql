CREATE TABLE IF NOT EXISTS `AHA_USER` (
  `uid` varchar(128) NOT NULL,
  `email` varchar(256) NOT NULL,
  `displayName` varchar(128) NOT NULL,
  `hashedPassword` varchar(256) NOT NULL,
  `createdDatetime` bigint(20) NOT NULL,
  `activated` BOOLEAN NOT NULL,
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


CREATE TABLE IF NOT EXISTS `AHA_ACTIVATION` (
  `uid` varchar(128) NOT NULL,
  `userUid` varchar(128) NOT NULL,
  `token` varchar(256) NOT NULL,
  `createdDatetime` bigint(20) NOT NULL,
  `activatedDatetime` bigint(20) DEFAULT NULL,

  PRIMARY KEY (`uid`),
  UNIQUE KEY `UK_TOKEN` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


ALTER TABLE AHA_AUTH_SESSION ADD CONSTRAINT `FK_USERUID_AUTHSESSION2USER` FOREIGN KEY IF NOT EXISTS (`userUid`) REFERENCES `AHA_USER` (`uid`);
ALTER TABLE AHA_ACTIVATION ADD CONSTRAINT `FK_USERUID_ACTIVATION2USER` FOREIGN KEY IF NOT EXISTS (`userUid`) REFERENCES `AHA_USER` (`uid`);

/**
 * Implement #1 Disallow Changes for Authenticated Users via OAuth 
 */
ALTER TABLE `AHA_USER` ADD COLUMN IF NOT EXISTS `signupDomain` VARCHAR(64) DEFAULT NULL;
ALTER TABLE `AHA_AUTH_SESSION` ADD COLUMN IF NOT EXISTS `signinDomain` VARCHAR(64) DEFAULT NULL;


/**
 * Implement #2 Support last 7 days rolling average of active users
 */
CREATE TABLE IF NOT EXISTS `AHA_DAILY_ACTIVE_USER` (
  `date` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  `createdDatetime` bigint(20) NOT NULL,

  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;