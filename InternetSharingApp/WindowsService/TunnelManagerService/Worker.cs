using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TunnelManagerService.Managers;

namespace TunnelManagerService
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly TunnelManager _tunnelManager;
        private readonly NetworkManager _networkManager;

        public Worker(ILogger<Worker> logger)
        {
            _logger = logger;
            _tunnelManager = new TunnelManager();
            _networkManager = new NetworkManager();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("TunnelManagerService running at: {time}", DateTimeOffset.Now);

            _networkManager.DetectAdapters();

            while (!stoppingToken.IsCancellationRequested)
            {
                // Here we would eventually listen to a Named Pipe for IPC from the WPF GUI.
                await Task.Delay(10000, stoppingToken);
            }
        }
    }
}
