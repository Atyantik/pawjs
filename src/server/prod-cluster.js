import cluster from "cluster";
import os from "os";
if (cluster.isMaster) {

  // Keep track of http requests
  let servers = 0;
  const numCPUs = os.cpus().length;

  // eslint-disable-next-line
  console.log(`Current environment has ${numCPUs} number of CPUs. Thus ${numCPUs} workers would be created!`);

  // Count requests
  const messageHandler = (msg) => {
    if (msg.cmd && msg.cmd === "notifyServerStart") {
      servers += 1;
      // eslint-disable-next-line
      console.log(`Cluster-Server #${servers} started`);
      if (servers === numCPUs) {

        // eslint-disable-next-line
        console.log(msg.message);
      }

    }
  };

  // Start workers and listen for messages containing notifyRequest

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on("message", messageHandler);
  }

} else {
  // Worker processes have a http server.
  require("./prod");

}