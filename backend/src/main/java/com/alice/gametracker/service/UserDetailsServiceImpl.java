package com.alice.gametracker.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.gametracker.model.Account;
import com.alice.gametracker.repository.AccountRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    AccountRepository accountRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));
        
        return UserPrincipal.build(account);
    }
    
    public static class UserPrincipal implements UserDetails {
        private static final long serialVersionUID = 1L;
        
        private Long id;
        private String username;
        private String email;
        private String password;
        private List<GrantedAuthority> authorities;
        
        public UserPrincipal(Long id, String username, String email, String password, 
                            List<GrantedAuthority> authorities) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.password = password;
            this.authorities = authorities;
        }
        
        public static UserPrincipal build(Account account) {
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + account.getRole().name()));
            
            return new UserPrincipal(
                    account.getId(),
                    account.getUsername(),
                    account.getEmail(),
                    account.getPassword(),
                    authorities);
        }
        
        @Override
        public List<GrantedAuthority> getAuthorities() {
            return authorities;
        }
        
        public Long getId() {
            return id;
        }
        
        public String getEmail() {
            return email;
        }
        
        @Override
        public String getPassword() {
            return password;
        }
        
        @Override
        public String getUsername() {
            return username;
        }
        
        @Override
        public boolean isAccountNonExpired() {
            return true;
        }
        
        @Override
        public boolean isAccountNonLocked() {
            return true;
        }
        
        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }
        
        @Override
        public boolean isEnabled() {
            return true;
        }
    }
}
