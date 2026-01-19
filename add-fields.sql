-- 添加 birthDate 和 gender 字段到 users 表
-- 如果字段已存在，这些语句会报错，但不会影响数据库

-- 添加 birthDate 字段（如果不存在）
ALTER TABLE `users` 
ADD COLUMN `birthDate` VARCHAR(20) NULL 
AFTER `loginMethod`;

-- 添加 gender 字段（如果不存在）
ALTER TABLE `users` 
ADD COLUMN `gender` VARCHAR(10) NULL 
AFTER `birthDate`;
