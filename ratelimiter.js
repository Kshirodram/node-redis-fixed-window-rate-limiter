const redis = require("redis");
const redisClient = redis.createClient();

module.exports = (req, res, next) => {
  const IP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  redisClient.exists(IP, (err, reply) => {
    if (err) {
      console.log("Redis not working...");
      system.exit(0);
    }
    // If IP address already exist
    if (reply === 1) {
      redisClient.get(IP, (err, reply) => {
        const data = JSON.parse(reply);
        const timeDifference = (Date.now() - data.startTime) / (5 * 1000); // every 5 sec allow 3 req
        if (timeDifference < 1) {
          if (data.count > 3) {
            return res
              .status(429)
              .json({ error: 1, message: "throttled limit exceeded..." });
          }
          // update the count and allow the request
          data.count++;
          redisClient.set(IP, JSON.stringify(data));
        } else {
          redisClient.set(
            IP,
            JSON.stringify({ startTime: Date.now(), count: 1 })
          );
        }
        next();
      });
    } else {
      redisClient.set(IP, JSON.stringify({ startTime: Date.now(), count: 1 }));
      next();
    }
  });
};
