return redis.call('lpush', KEYS[1], table.concat({'foo', ARGV[1], ARGV[2]}, ':'));
