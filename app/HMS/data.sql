-- MySQL dump 10.13  Distrib 8.4.3, for Linux (x86_64)
--
-- Host: localhost    Database: proj_hms
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Departments`
--

DROP TABLE IF EXISTS `Departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Departments` (
  `DepartmentID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci,
  `Location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`DepartmentID`),
  UNIQUE KEY `Name` (`Name`),
  CONSTRAINT `chk_name_length` CHECK ((length(`Name`) >= 2))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Departments`
--

LOCK TABLES `Departments` WRITE;
/*!40000 ALTER TABLE `Departments` DISABLE KEYS */;
INSERT INTO `Departments` VALUES (1,'内科','诊治内脏疾病','门诊楼1层','2024-12-02 20:02:43','2024-12-02 20:02:43',1),(2,'外科','进行手术治疗','门诊楼2层','2024-12-02 20:02:43','2024-12-02 20:02:43',1),(3,'儿科','专门治疗儿童疾病','门诊楼1层','2024-12-02 20:02:43','2024-12-02 20:02:43',1),(4,'妇产科','妇女保健和分娩','住院部3层','2024-12-02 20:02:43','2024-12-02 20:02:43',1),(5,'急诊科','紧急医疗救治','急诊楼1层','2024-12-02 20:02:43','2024-12-02 20:02:43',1),(6,'骨科','骨骼和运动系统疾病','门诊楼2层','2024-12-02 20:02:43','2024-12-02 20:02:43',1);
/*!40000 ALTER TABLE `Departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Doctors`
--

DROP TABLE IF EXISTS `Doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Doctors` (
  `DoctorID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Gender` char(1) NOT NULL,
  `Phone` varchar(15) NOT NULL,
  `DepartmentID` int NOT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isVerified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`DoctorID`),
  KEY `DepartmentID` (`DepartmentID`),
  CONSTRAINT `Doctors_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `Departments` (`DepartmentID`),
  CONSTRAINT `chk_doctor_name` CHECK ((length(`Name`) >= 2)),
  CONSTRAINT `chk_doctor_phone` CHECK ((length(`Phone`) >= 8)),
  CONSTRAINT `Doctors_chk_1` CHECK ((`Gender` in (_utf8mb4'M',_utf8mb4'F')))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Doctors`
--

LOCK TABLES `Doctors` WRITE;
/*!40000 ALTER TABLE `Doctors` DISABLE KEYS */;
INSERT INTO `Doctors` VALUES (1,'张医生','M','13800138001',2,'2024-12-03 10:05:27','2024-12-03 10:05:27',1),(2,'李医生','F','13800138002',2,'2024-12-03 10:05:27','2024-12-03 10:05:27',1),(3,'王医生','M','13800138003',3,'2024-12-03 10:05:27','2024-12-03 10:05:27',1),(4,'赵医生','F','13800138004',4,'2024-12-03 10:05:27','2024-12-03 10:05:27',1),(6,'刘医生','F','13592737093',3,'2024-12-03 13:38:17','2024-12-03 14:05:40',1);
/*!40000 ALTER TABLE `Doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Examinations`
--

DROP TABLE IF EXISTS `Examinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Examinations` (
  `ExamID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `RecordID` int NOT NULL,
  `ExamType` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Result` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Notes` text COLLATE utf8mb4_unicode_ci,
  `Date` datetime NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ExamID`),
  KEY `PatientID` (`PatientID`),
  KEY `DoctorID` (`DoctorID`),
  KEY `RecordID` (`RecordID`),
  CONSTRAINT `Examinations_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `Patients` (`PatientID`),
  CONSTRAINT `Examinations_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `Doctors` (`DoctorID`),
  CONSTRAINT `Examinations_ibfk_3` FOREIGN KEY (`RecordID`) REFERENCES `TreatmentRecords` (`RecordID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Examinations`
--

LOCK TABLES `Examinations` WRITE;
/*!40000 ALTER TABLE `Examinations` DISABLE KEYS */;
INSERT INTO `Examinations` VALUES (1,1,1,1,'血常规','各项指标正常','建议多休息','2024-12-01 09:30:00','2024-12-03 01:37:03','2024-12-03 01:37:03'),(2,2,2,2,'X光检查','右腿胫骨骨折','需要手术治疗','2024-12-01 11:00:00','2024-12-03 01:37:03','2024-12-03 01:37:03'),(3,3,3,3,'体温监测','38.5度','需要持续观察','2024-12-02 14:30:00','2024-12-03 01:37:03','2024-12-03 01:37:03'),(4,4,1,4,'血压测量','150/90mmHg','需要定期监测','2024-12-02 17:00:00','2024-12-03 01:37:03','2024-12-03 01:37:03'),(5,5,4,5,'胃镜检查','胃粘膜轻度炎症','建议调整饮食','2024-12-03 09:00:00','2024-12-03 01:37:03','2024-12-03 01:37:03'),(6,2,1,8,'血常规','白细胞计数正常，未见感染迹象',NULL,'2024-12-03 12:16:59','2024-12-03 04:16:59','2024-12-03 04:16:59');
/*!40000 ALTER TABLE `Examinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Medicines`
--

DROP TABLE IF EXISTS `Medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Medicines` (
  `MedicineID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Specification` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Stock` int NOT NULL DEFAULT '0',
  `Description` text COLLATE utf8mb4_unicode_ci,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`MedicineID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Medicines`
--

LOCK TABLES `Medicines` WRITE;
/*!40000 ALTER TABLE `Medicines` DISABLE KEYS */;
INSERT INTO `Medicines` VALUES (1,'阿莫西林','500mg*20片','盒',100,'青霉素类抗生素','2024-12-02 12:02:43','2024-12-02 12:02:43'),(2,'布洛芬','0.2g*20片','盒',200,'解热镇痛药','2024-12-02 12:02:43','2024-12-02 12:02:43'),(3,'感冒灵','12片/盒','盒',150,'感冒药','2024-12-02 12:02:43','2024-12-02 12:02:43'),(4,'维生素C','100片/瓶','瓶',80,'维生素补充剂','2024-12-02 12:02:43','2024-12-02 12:02:43'),(5,'云南白药','100g/瓶','瓶',50,'跌打损伤','2024-12-02 12:02:43','2024-12-02 12:02:43');
/*!40000 ALTER TABLE `Medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NurseRoomAssignments`
--

DROP TABLE IF EXISTS `NurseRoomAssignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `NurseRoomAssignments` (
  `NurseID` int NOT NULL,
  `RoomID` int NOT NULL,
  `AssignedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`NurseID`,`RoomID`),
  KEY `RoomID` (`RoomID`),
  CONSTRAINT `NurseRoomAssignments_ibfk_1` FOREIGN KEY (`NurseID`) REFERENCES `Nurses` (`NurseID`) ON DELETE CASCADE,
  CONSTRAINT `NurseRoomAssignments_ibfk_2` FOREIGN KEY (`RoomID`) REFERENCES `Rooms` (`RoomID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NurseRoomAssignments`
--

LOCK TABLES `NurseRoomAssignments` WRITE;
/*!40000 ALTER TABLE `NurseRoomAssignments` DISABLE KEYS */;
INSERT INTO `NurseRoomAssignments` VALUES (1,4,'2024-12-02 20:26:23'),(2,1,'2024-12-03 13:37:10'),(2,2,'2024-12-03 13:37:10'),(2,3,'2024-12-03 13:37:10'),(3,3,'2024-12-03 14:15:00'),(3,4,'2024-12-03 14:15:00'),(4,4,'2024-12-02 20:02:43'),(4,5,'2024-12-02 20:02:43'),(5,5,'2024-12-02 20:02:43'),(5,6,'2024-12-02 20:02:43');
/*!40000 ALTER TABLE `NurseRoomAssignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Nurses`
--

DROP TABLE IF EXISTS `Nurses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Nurses` (
  `NurseID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Gender` enum('M','F') COLLATE utf8mb4_unicode_ci NOT NULL,
  `Phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Shift` enum('morning','afternoon','night') COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isVerified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`NurseID`),
  CONSTRAINT `chk_nurse_name` CHECK ((length(`Name`) >= 2)),
  CONSTRAINT `chk_nurse_phone` CHECK ((length(`Phone`) >= 8))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Nurses`
--

LOCK TABLES `Nurses` WRITE;
/*!40000 ALTER TABLE `Nurses` DISABLE KEYS */;
INSERT INTO `Nurses` VALUES (1,'刘护士','F','13900139001','morning','2024-12-02 20:02:43','2024-12-03 10:06:48',1),(2,'孙护士','F','13900139002','afternoon','2024-12-02 20:02:43','2024-12-03 10:06:48',1),(3,'周护士','F','13900139003','night','2024-12-02 20:02:43','2024-12-03 10:06:48',1),(4,'吴护士','F','13900139004','morning','2024-12-02 20:02:43','2024-12-02 20:02:43',0),(5,'郑护士','F','13900139005','afternoon','2024-12-02 20:02:43','2024-12-02 20:02:43',0);
/*!40000 ALTER TABLE `Nurses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PatientRoomAssignments`
--

DROP TABLE IF EXISTS `PatientRoomAssignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PatientRoomAssignments` (
  `AssignmentID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int NOT NULL,
  `RoomID` int NOT NULL,
  `StartDate` datetime NOT NULL,
  `EndDate` datetime DEFAULT NULL,
  `AssignedBy` int NOT NULL,
  `Reason` text COLLATE utf8mb4_unicode_ci,
  `Notes` text COLLATE utf8mb4_unicode_ci,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AssignmentID`),
  KEY `PatientID` (`PatientID`),
  KEY `RoomID` (`RoomID`),
  KEY `AssignedBy` (`AssignedBy`),
  CONSTRAINT `PatientRoomAssignments_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `Patients` (`PatientID`),
  CONSTRAINT `PatientRoomAssignments_ibfk_2` FOREIGN KEY (`RoomID`) REFERENCES `Rooms` (`RoomID`),
  CONSTRAINT `PatientRoomAssignments_ibfk_3` FOREIGN KEY (`AssignedBy`) REFERENCES `UserAccounts` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PatientRoomAssignments`
--

LOCK TABLES `PatientRoomAssignments` WRITE;
/*!40000 ALTER TABLE `PatientRoomAssignments` DISABLE KEYS */;
INSERT INTO `PatientRoomAssignments` VALUES (1,1,1,'2024-12-01 10:00:00','2024-12-03 10:00:00',1,'观察治疗',NULL,'2024-12-03 01:37:03'),(2,2,2,'2024-12-01 12:00:00',NULL,1,'骨折住院治疗',NULL,'2024-12-03 01:37:03'),(3,3,3,'2024-12-02 15:00:00',NULL,1,'发烧观察',NULL,'2024-12-03 01:37:03'),(4,4,4,'2024-12-02 18:00:00',NULL,1,'血压监测',NULL,'2024-12-03 01:37:03'),(5,5,1,'2024-12-03 10:00:00',NULL,1,'胃炎治疗',NULL,'2024-12-03 01:37:03');
/*!40000 ALTER TABLE `PatientRoomAssignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Patients`
--

DROP TABLE IF EXISTS `Patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patients` (
  `PatientID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Gender` char(1) NOT NULL,
  `DateOfBirth` date NOT NULL,
  `Phone` varchar(15) NOT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `RoomID` int DEFAULT NULL,
  PRIMARY KEY (`PatientID`),
  KEY `RoomID` (`RoomID`),
  CONSTRAINT `Patients_ibfk_1` FOREIGN KEY (`RoomID`) REFERENCES `Rooms` (`RoomID`),
  CONSTRAINT `Patients_chk_1` CHECK ((`Gender` in (_utf8mb4'M',_utf8mb4'F')))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Patients`
--

LOCK TABLES `Patients` WRITE;
/*!40000 ALTER TABLE `Patients` DISABLE KEYS */;
INSERT INTO `Patients` VALUES (1,'张病人','M','1980-01-01','13700137001','北京市海淀区',NULL),(2,'王病人','F','1990-02-02','13700137002','北京市朝阳区',NULL),(3,'李病人','M','1985-03-03','13700137003','北京市西城区',NULL),(4,'赵病人','F','1995-04-04','13700137004','北京市东城区',NULL),(5,'钱病人','M','1982-05-05','13700137005','北京市丰台区',NULL),(6,'陈患者','M','1976-09-24','16720038021','广东省韶关市韶华二路',NULL);
/*!40000 ALTER TABLE `Patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rooms`
--

DROP TABLE IF EXISTS `Rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Rooms` (
  `RoomID` int NOT NULL AUTO_INCREMENT,
  `RoomNumber` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `RoomType` enum('normal','icu','operation','ward') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '普通病房/重症监护室/手术室',
  `Floor` int NOT NULL,
  `Building` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `BedCount` int NOT NULL DEFAULT '1',
  `Description` text COLLATE utf8mb4_unicode_ci,
  `Status` enum('available','occupied','maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available' COMMENT '可用/占用/维护',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`RoomID`),
  UNIQUE KEY `RoomNumber` (`RoomNumber`),
  CONSTRAINT `chk_bed_count` CHECK ((`BedCount` > 0)),
  CONSTRAINT `chk_floor` CHECK ((`Floor` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rooms`
--

LOCK TABLES `Rooms` WRITE;
/*!40000 ALTER TABLE `Rooms` DISABLE KEYS */;
INSERT INTO `Rooms` VALUES (1,'101','ward',1,'A栋',4,'','available','2024-12-02 20:02:43','2024-12-03 13:30:39',1),(2,'102','ward',1,'A栋',4,NULL,'available','2024-12-02 20:02:43','2024-12-02 20:40:49',1),(3,'201','icu',2,'B栋',2,NULL,'available','2024-12-02 20:02:43','2024-12-02 20:02:43',1),(4,'202','icu',2,'B栋',2,NULL,'occupied','2024-12-02 20:02:43','2024-12-02 20:02:43',1),(5,'301','operation',3,'C栋',1,NULL,'available','2024-12-02 20:02:43','2024-12-02 20:02:43',1),(6,'302','operation',3,'C栋',1,NULL,'maintenance','2024-12-02 20:02:43','2024-12-02 20:02:43',1);
/*!40000 ALTER TABLE `Rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TreatmentMedications`
--

DROP TABLE IF EXISTS `TreatmentMedications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TreatmentMedications` (
  `TreatmentMedicationID` int NOT NULL AUTO_INCREMENT,
  `RecordID` int NOT NULL,
  `MedicineID` int NOT NULL,
  `Dosage` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Frequency` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Duration` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Notes` text COLLATE utf8mb4_unicode_ci,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TreatmentMedicationID`),
  KEY `RecordID` (`RecordID`),
  KEY `MedicineID` (`MedicineID`),
  CONSTRAINT `TreatmentMedications_ibfk_1` FOREIGN KEY (`RecordID`) REFERENCES `TreatmentRecords` (`RecordID`) ON DELETE CASCADE,
  CONSTRAINT `TreatmentMedications_ibfk_2` FOREIGN KEY (`MedicineID`) REFERENCES `Medicines` (`MedicineID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TreatmentMedications`
--

LOCK TABLES `TreatmentMedications` WRITE;
/*!40000 ALTER TABLE `TreatmentMedications` DISABLE KEYS */;
INSERT INTO `TreatmentMedications` VALUES (1,1,3,'1片','每日3次','3天','饭后服用','2024-12-03 01:37:03','2024-12-03 01:37:03'),(2,2,5,'1瓶','每日2次','7天','外用','2024-12-03 01:37:03','2024-12-03 01:37:03'),(3,3,2,'1片','每4小时1次','2天','发烧时服用','2024-12-03 01:37:03','2024-12-03 01:37:03'),(4,4,1,'1片','每日2次','30天','早晚各一次','2024-12-03 01:37:03','2024-12-03 01:37:03'),(5,5,2,'1片','每日3次','5天','饭后服用','2024-12-03 01:37:03','2024-12-03 01:37:03'),(6,8,1,'每次2片','每日3次','7天',NULL,'2024-12-03 04:16:59','2024-12-03 04:16:59');
/*!40000 ALTER TABLE `TreatmentMedications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TreatmentRecords`
--

DROP TABLE IF EXISTS `TreatmentRecords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TreatmentRecords` (
  `RecordID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `Date` datetime NOT NULL,
  `Diagnosis` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Treatment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Status` enum('ongoing','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ongoing',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`RecordID`),
  KEY `PatientID` (`PatientID`),
  KEY `DoctorID` (`DoctorID`),
  CONSTRAINT `TreatmentRecords_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `Patients` (`PatientID`),
  CONSTRAINT `TreatmentRecords_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `Doctors` (`DoctorID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TreatmentRecords`
--

LOCK TABLES `TreatmentRecords` WRITE;
/*!40000 ALTER TABLE `TreatmentRecords` DISABLE KEYS */;
INSERT INTO `TreatmentRecords` VALUES (1,1,1,'2024-12-01 09:00:00','普通感冒','建议多休息，服用感冒药','completed','2024-12-03 01:37:03','2024-12-03 01:37:03'),(2,2,2,'2024-12-01 10:30:00','骨折','石膏固定，需要住院观察','ongoing','2024-12-03 01:37:03','2024-12-03 01:37:03'),(3,3,3,'2024-12-02 14:00:00','发烧','退烧药物治疗，观察体温变化','ongoing','2024-12-03 01:37:03','2024-12-03 01:37:03'),(4,4,1,'2024-12-02 16:30:00','高血压','降压药物治疗，定期复查','completed','2024-12-03 01:37:03','2024-12-03 02:43:39'),(5,5,4,'2024-12-03 08:30:00','胃炎','制酸药物治疗，调整饮食习惯','ongoing','2024-12-03 01:37:03','2024-12-03 01:37:03'),(8,2,1,'2024-12-03 12:16:59','急性扁桃体炎','开处方阿莫西林，配合症状治疗','completed','2024-12-03 04:16:59','2024-12-03 04:23:36');
/*!40000 ALTER TABLE `TreatmentRecords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserAccounts`
--

DROP TABLE IF EXISTS `UserAccounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserAccounts` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Role` enum('admin','doctor','nurse','patient') COLLATE utf8mb4_unicode_ci NOT NULL,
  `RelatedID` int NOT NULL,
  `LastLogin` datetime DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`),
  KEY `idx_username` (`Username`),
  KEY `idx_role_related` (`Role`,`RelatedID`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserAccounts`
--

LOCK TABLES `UserAccounts` WRITE;
/*!40000 ALTER TABLE `UserAccounts` DISABLE KEYS */;
INSERT INTO `UserAccounts` VALUES (1,'admin','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','admin',0,'2024-12-03 16:05:19','2024-12-02 12:02:43','2024-12-03 08:05:19'),(2,'d1','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','doctor',1,'2024-12-03 14:40:22','2024-12-02 12:02:43','2024-12-03 06:40:22'),(3,'d2','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','doctor',2,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(4,'d3','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','doctor',3,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(5,'d4','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','doctor',4,NULL,'2024-12-02 12:02:43','2024-12-02 12:09:08'),(7,'n1','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','nurse',1,'2024-12-03 14:39:06','2024-12-02 12:02:43','2024-12-03 06:39:06'),(8,'n2','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','nurse',2,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(9,'n3','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','nurse',3,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(10,'n4','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','nurse',4,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(11,'n5','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','nurse',5,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(12,'p1','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','patient',1,'2024-12-03 14:39:14','2024-12-02 12:02:43','2024-12-03 06:39:14'),(13,'p2','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','patient',2,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(14,'p3','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','patient',3,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(15,'p4','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','patient',4,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(16,'p5','$2a$10$stJivEQafVC4bzNyEKHL4uP6WiqMJk3qfXH.Wk5raaEUUMGMqtZ6y','patient',5,NULL,'2024-12-02 12:02:43','2024-12-02 12:07:17'),(18,'p6','$2a$10$K6xDkAzjbRf6Gqs.kluIW.CweOKzWSeVJqrgulE7lScUiTTa02Ku6','patient',6,'2024-12-03 12:46:44','2024-12-03 04:46:39','2024-12-03 04:46:44'),(19,'d6','$2a$10$n/E2KYu4st.XE3TpGBgJzuqJq92WE0/DQ8YUWfSgB1pFshVlYVnGy','doctor',6,'2024-12-03 14:06:17','2024-12-03 05:38:17','2024-12-03 06:06:17');
/*!40000 ALTER TABLE `UserAccounts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-04 20:14:12
