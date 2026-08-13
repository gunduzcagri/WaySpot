using System.ComponentModel.DataAnnotations;
using WaySpot.Core.Enums;

namespace WaySpot.Core.DTOs;

public class RegisterRequest
{
    [Required, MinLength(2), MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MinLength(2), MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, MinLength(3), MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must be at least 8 characters with uppercase, lowercase, number and special character.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password", ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; } = UserRole.User;
}
