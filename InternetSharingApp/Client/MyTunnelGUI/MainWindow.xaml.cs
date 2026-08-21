using System;
using System.Windows;
using System.Windows.Media;

namespace MyTunnelGUI
{
    public partial class MainWindow : Window
    {
        private bool _isSharing = false;

        public MainWindow()
        {
            InitializeComponent();
        }

        private void StartSharingButton_Click(object sender, RoutedEventArgs e)
        {
            if (!_isSharing)
            {
                // Start sharing state
                _isSharing = true;
                StartSharingButton.Content = "STOP SHARING";
                StartSharingButton.Background = new SolidColorBrush(Color.FromRgb(204, 0, 0)); // Red color

                // Generate a random Connection Code
                string code = GenerateConnectionCode();
                ConnectionCodeTextBox.Text = code;
            }
            else
            {
                // Stop sharing state
                _isSharing = false;
                StartSharingButton.Content = "START SHARING";
                StartSharingButton.Background = new SolidColorBrush(Color.FromRgb(0, 122, 204)); // Default Blue

                // Clear the Connection Code
                ConnectionCodeTextBox.Text = "";
            }
        }

        private string GenerateConnectionCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            char[] stringChars = new char[9];

            for (int i = 0; i < 4; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            stringChars[4] = '-';

            for (int i = 5; i < 9; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            return new String(stringChars);
        }
    }
}
